import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { AlertProvider } from 'ui/widgets/alert';
import NavigationProvider from '../widgets/navigation';

export default function App({ Component, pageProps }: AppProps) {
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
    </ThemeProvider>
}