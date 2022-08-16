import type { UserRole } from '../../data/models/user'
import { AUTH_TOKEN_LENGTH } from './constants';


export namespace AuthToken {
    export type Data = {
        role: UserRole
    }

    export function create(data: Data) {
        return btoa(JSON.stringify(data));
    }

    export function decode(token: string) {
        return JSON.parse(atob(token.slice(AUTH_TOKEN_LENGTH)));
    }
    
}