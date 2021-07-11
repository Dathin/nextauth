import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanParams = {
    permissions?: string[];
    roles?: string[];
}

export function useCan({permissions, roles}: UseCanParams){
    const {user, isAuthenticated} = useContext(AuthContext);

    if (!isAuthenticated){
        return false;
    }

    
    if (user){
        return validateUserPermissions({user, permissions, roles});
    }

    return false;
    

 }