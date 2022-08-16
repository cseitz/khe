import { CssBaseline, ThemeProvider } from '@mui/material';
import { Authentication } from 'api/auth';
import { trpc } from 'api/trpc';
import { AppProps } from 'next/app';
import { AlertProvider } from 'ui/widgets/alert';
import { withSuperJSON } from 'utils/next';
import { useAppTheme } from '../theme/index';
import NavigationProvider from '../widgets/navigation';

export function App({ Component, pageProps }: AppProps) {
    const theme = useAppTheme();
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavigationProvider>
            <AlertProvider>
                <Component {...pageProps} />
            </AlertProvider>
        </NavigationProvider>
        <SessionController />
    </ThemeProvider>
}

export default trpc.withTRPC(
    withSuperJSON(App)
);

function SessionController() {
    const [query, session] = Authentication.useSession();

    return <div>
        session: {JSON.stringify(session)}
    </div>
}