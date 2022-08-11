import { createTheme, SxProps } from '@mui/material';
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

let theme: ReturnType<typeof useAppTheme>;
export function useAppTheme() {
    const prefersDarkMode = false; //useMediaQuery(`(prefers-color-scheme: dark)`);
    const _theme = useMemo(() => {
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
    theme = _theme;
    return _theme;
}


export namespace Theme {

    export function Background(type: 'primary'): SxProps {
        switch (type) {
            case 'primary': {
                return {
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.light,
                }
            }
        }
        return {}
    }
}