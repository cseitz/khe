import { createTheme } from '@mui/material';
import { useMemo } from 'react';

declare module '@mui/material/styles' {
    interface Theme {
        // status: {
        //     danger: string;
        // };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        // status?: {
        //     danger?: string;
        // };
    }
}

export function useAppTheme() {
    const prefersDarkMode = false; //useMediaQuery(`(prefers-color-scheme: dark)`);
    return useMemo(() => {
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
}

