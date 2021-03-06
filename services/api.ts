import axios, {AxiosError} from 'axios'
import { parseCookies, setCookie } from 'nookies'
import Router from 'next/router'
import { signOut } from '../contexts/AuthContext';
import { GetServerSidePropsContext } from 'next';
import { AuthTokenError } from '../errors/AuthTokenError';

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx: GetServerSidePropsContext | undefined = undefined){
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });
    
    api.interceptors.response.use(resposne => resposne, (error: AxiosError) => {
        if(error.response?.status === 401){
            if(error.response.data?.code === 'token.expired'){
                cookies = parseCookies();
    
                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config
                if (!isRefreshing){
                    isRefreshing = true;
                    api.post('/refresh', {
                        refreshToken
                    }).then(response => {
                        const {token} = response.data;
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/' // 30 dias
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/' // 30 dias
                        })
                        api.defaults.headers['Authorization'] = `Bearer ${token}`
                    
                        failedRequestsQueue.forEach(request => request.resolve(token))
                    }).catch(err => {
                        failedRequestsQueue.forEach(request => request.reject(err))
                    
                        if(process.browser){
                            signOut()
                        }
                    }).finally(() => {
                        isRefreshing = false;
                        failedRequestsQueue = [];
                    })
                }
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        resolve: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            
                            resolve(api(originalConfig))
                        },
                        reject: (err: AxiosError) => {
                            reject(err);
                        },
                    })
                })
            } else {
                if(process.browser){
                    signOut()
                } else {
                    return Promise.reject(new AuthTokenError())
                }
            }
    
            return Promise.reject(error);
        }
        console.log(error.response?.status)
    })

    return api;
}