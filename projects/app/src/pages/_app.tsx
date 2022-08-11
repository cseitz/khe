import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppProps } from 'next/app';
import { AlertProvider } from 'ui/widgets/alert';
import { useAppTheme } from '../theme/index';
import NavigationProvider from '../widgets/navigation';

export default function App({ Component, pageProps }: AppProps) {
    const theme = useAppTheme();
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavigationProvider>
            <AlertProvider>
                <Component {...pageProps} />
            </AlertProvider>
        </NavigationProvider>
    </ThemeProvider>
}