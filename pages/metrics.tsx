import { useContext } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupApiClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"
import decode from 'jwt-decode';

export default function Dashboard(){
    const {user} = useContext(AuthContext)
    
    return (
                    <div>Métricas</div>
        )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupApiClient(ctx);
    const user = decode()
    return {
        props: {

        }
    }
}, {
    permissions: ['metrics.list'],
    roles: ['administrator']
})