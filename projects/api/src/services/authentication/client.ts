


/** @export 'auth' */

import { useQueryClient } from '@tanstack/react-query';
import { HTTPHeaders } from '@trpc/client';
import { useRouter } from 'next/router';
import { UserData } from '../../data/models/user';
import { api } from '../../trpc/client';
import { AUTH_COOKIE, AUTH_STORAGE_KEY } from './constants';
import { AuthToken } from './token';




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

    function setToken(newToken: string | null) {
        token = newToken;
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
            localStorage.setItem('had:' + STORAGE_KEY, 'yes');
            // console.log(AuthToken.decode(token));
            if (typeof window !== 'undefined') {
                document.cookie = `${AUTH_COOKIE}=${newToken}; path=/`;
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
            document.cookie = `${AUTH_COOKIE}=${newToken}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        }
        
    }

    export function useLogin(props: Parameters<typeof api.auth.login.useMutation>[0] = {}) {
        const { onSuccess = null, ...rest } = props
        const client = useQueryClient();
        return api.auth.login.useMutation({
            ...rest,
            onSuccess(data, vars, context) {
                if (data.token) {
                    setToken(data.token);
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
                setToken(null);
                client.invalidateQueries(['auth.me']);
                if (onSuccess) onSuccess(data, vars, context);
            }
        });
    }

    let Myself: UserData;
    export function useMe() {
        const router = useRouter();
        const me = api.auth.me.useQuery();
        if (me.data && me.data.user) {
            const { user, token } = me.data;
            setToken(token);
            Myself = user;
        } else if (me.data) {
            if (!router.pathname.startsWith('/login')) {
                console.log('oof, you are dead')
            }
        }
        return me;
    }


}


const { isAuthenticated, isReturningUser } = Authentication;
export { isAuthenticated, isReturningUser }