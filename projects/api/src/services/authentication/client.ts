


/** @export 'auth' */

import { useQueryClient } from '@tanstack/react-query';
import { HTTPHeaders } from '@trpc/client';
import { UserData } from '../../data/models/user';
import { api } from '../../trpc/client';
import { AUTH_STORAGE_KEY } from './constants';




export namespace Authentication {
    const STORAGE_KEY = AUTH_STORAGE_KEY;
    let token: string | null = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || null;

    export function getToken() {
        return token;
    }

    export function isAuthenticated() {
        return getToken();
    }

    export function isReturningUser() {
        return typeof window !== 'undefined' && localStorage.getItem('had:' + STORAGE_KEY)
    }

    export function headers(): HTTPHeaders {
        if (token) {
            return { authorization: token }
        }
        return {}
    }

    function setToken(newToken: string) {
        token = newToken;
        localStorage.setItem(STORAGE_KEY, token);
        localStorage.setItem('had:' + STORAGE_KEY, 'yes');
    }

    export function useLogin(props: Parameters<typeof api.auth.login.useMutation>[0] = {}) {
        const { onSuccess = null, ...rest } = props
        const client = useQueryClient();
        return api.auth.login.useMutation({
            ...rest,
            onSuccess(data, vars, context) {
                if (data.token) {
                    setToken(data.token);
                    console.log('Logged in');
                    client.invalidateQueries(['auth.me']);
                    if (onSuccess) onSuccess(data, vars, context);
                }
            }
        });
    }

    export function useLogout(props: Parameters<typeof api.auth.logout.useMutation>[0] = {}) {
        const { onSuccess = null, ...rest } = props
        const client = useQueryClient();
        return api.auth.logout.useMutation({
            ...rest,
            onSuccess(data, vars, context) {
                token = null;
                localStorage.removeItem(STORAGE_KEY);
                console.log('Logged out');
                client.invalidateQueries(['auth.me']);
                if (onSuccess) onSuccess(data, vars, context);
            }
        });
    }

    let Myself: UserData;
    export function useMe() {
        const me = api.auth.me.useQuery();
        if (me.data) {
            const { user, token } = me.data;
            setToken(token);
            Myself = user;
        }
        return me;
    }


}


const { isAuthenticated, isReturningUser } = Authentication;
export { isAuthenticated, isReturningUser }