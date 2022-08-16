import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { Authentication } from 'api/auth';
import { UserRole } from 'api/data/user';
import { trpc } from 'api/trpc';
import { differenceWith, fromPairs, isEqual, reduce, toPairs } from 'lodash';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { AlertProvider } from 'ui/widgets/alert';
import NavigationProvider from '../widgets/navigation';

function App({ Component, pageProps }: AppProps) {
    const prefersDarkMode = useMediaQuery(`(prefers-color-scheme: dark)`);
    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: prefersDarkMode ? 'dark' : 'light',
                background: {
                    default: prefersDarkMode ? '#35363a' : 'white',
                },
                primary: {
                    main: '#1976d2'
                }
            },
            components: {
                MuiPagination: {
                    styleOverrides: {
                        ul: {
                            justifyContent: 'center'
                        }
                    }
                },
                MuiTextField: {
                    defaultProps: {
                        InputLabelProps: {
                            shrink: true
                        }
                    }
                }
            }
        })
    }, [prefersDarkMode]);
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavigationProvider>
            <AlertProvider>
                <Component {...pageProps} />
            </AlertProvider>
        </NavigationProvider>
        <SessionController />
    </ThemeProvider >
}

export default trpc.withTRPC(App);



function SessionController() {
    const router = useRouter();
    const [query, session] = Authentication.useSession();
    const [previous, setPrevious] = useState(session);
    useEffect(() => {
        setPrevious(session);
        const [before, after] = [previous, session];

        if (!before) {
            // user logged in

        } else if (!after) {
            // user logged out

        } else {
            // something changes

            const diff: Partial<NonNullable<typeof session>> = fromPairs(
                differenceWith(toPairs(before || {}), toPairs(after || {}), isEqual)
            );

        }



    }, [session]);


    useEffect(() => {

        let role = session ? session?.role : false;
        if (role && role === UserRole.Staff || role === UserRole.Admin) {
            if (router.pathname.startsWith('/login')) {
                router.push('/');
            }
        } else if (session !== null) {
            if (!(
                router.pathname.startsWith('/login')
                || router.pathname.startsWith('/logout')
            )) {
                router.push('/login')
            }
        }

    }, [session ? session?.role : false])

    return <div>
        session: {JSON.stringify(session)}
    </div>
}

