import { useQueryClient } from '@tanstack/react-query';
import { HTTPHeaders } from '@trpc/client';
import { useRouter } from 'next/router';
import { ContextType, createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { UserData } from '../../data/models/user';
import { api } from '../../trpc/client';
import { AUTH_COOKIE, AUTH_STORAGE_KEY } from './constants';
import { AuthToken, AuthTokenData } from './token';

/** @export 'auth' */


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
        // @ts-ignore
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
        // @ts-ignore
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
            // if (!router.pathname.startsWith('/login')) {
            //     console.log('oof, you are dead')
            // }
        }
        return me;
    }

    export type SessionData = {
        user: Omit<UserData, 'password'>;
    } & AuthTokenData | null | false;

    export function useSessionLogic() {
        const router = useRouter();
        const query = api.auth.me.useQuery();

        const session = useMemo<SessionData>(() => {
            if (query.data === undefined) return null;
            if (query.data === false) return false;
            // if (query.data) return false;
            const { token, user } = query.data;
            setToken(token);
            return {
                ...AuthToken.decode(token),
                user,
            }
        }, [query.dataUpdatedAt]);

        console.log(query.data);

        return [query, session] as [typeof query, SessionData];
    }


}


const { isAuthenticated, isReturningUser } = Authentication;
export { isAuthenticated, isReturningUser }

export const SessionContext = createContext<Authentication.SessionData>(null);

export function SessionProvider(props: { children: any }) {
    const { children } = props;
    // const [query, data] = Authentication.useSessionLogic();
    const data = useRef<ContextType<typeof SessionContext>>(null);
    return <SessionContext.Provider value={data.current}>
        <>
            <SessionUpdater ref={data} />
            {children}
        </>
    </SessionContext.Provider>
}

function SessionUpdater(props: { ref: any }) {
    const [query, data] = Authentication.useSessionLogic();
    
    return <></>
}

export function useSession() {
    return useContext(SessionContext)
}