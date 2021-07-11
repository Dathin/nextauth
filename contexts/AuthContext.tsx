import { useRouter } from "next/router";
import { createContext, ReactNode, useState } from "react";
import Router from 'next/router'
import { api } from "../services/api";
import { setCookie } from 'nookies'

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials) : Promise<void>;
    user: User | undefined;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    async function signIn({email, password}: SignInCredentials){
        try {
            const { data } = await api.post('sessions', {
                email,
                password
            })

            const {token, refreshToken, permissions, roles} = data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/' // 30 dias
            })
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/' // 30 dias
            })

            setUser({
                email,
                permissions,
                roles,
            })

            Router.push('/dashboard')

        } catch (err){
            console.log(err);
        }
        
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, signIn, user}}>
            {children}
        </AuthContext.Provider>
    )
}