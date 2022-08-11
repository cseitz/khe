import { AppBar, Box, BoxProps, Button, ClickAwayListener, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Slide, SxProps, Toolbar, Tooltip, Typography, useMediaQuery, useScrollTrigger } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createContext, MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu'

/** @export 'widgets/navigation' */

// -----------------------------------------------------

type NavigationComputed<R> = R | ((ctx: { type: 'navbar' | 'drawer' }) => R);

type BaseNavigationEntry = {
    /** The content displayed in the button */
    content: string;
    /** Navbar Alignment */
    alignment?: 'left' | 'right';
    /** Visibility */
    visible?: NavigationComputed<boolean>;
    /** Icon to be added to the button */
    icon?: any;
    /** Where should the icon be shown? (false = hidden) */
    iconPlacement?: NavigationComputed<'start' | 'end' | false>;
}

type NavigationButton = {
    type: 'button',
    /** The URL that this route corresponds to */
    url: string;
    /** Tooltip to show below the button */
    tooltip?: string;
} & BaseNavigationEntry;

type NavigationDropdown = {
    type: 'dropdown',
    buttons: NavigationButton[]
} & BaseNavigationEntry;

type NavigationEntry = NavigationButton | NavigationDropdown;

type NavigationContext = {
    /** Buttons to show in navigation */
    buttons: NavigationEntry[];
    /** Content to put next to the drawer button */
    title?: string | JSX.Element;
}


export const NavigationContext = createContext<NavigationContext>({
    buttons: []
});


// -----------------------------------------------------

export function Navigation() {
    const nav = useNavigation();
    return <>
        <NavigationBar {...nav} />
        <NavigationDrawer {...nav} />
    </>
}

function NavigationBar(props: ReturnType<typeof useNavigation>) {
    const { visible, openDrawer, isMobile, buttons } = props;
    let { title } = useContext(NavigationContext);
    if (title && typeof title === 'string') {
        title = <Typography variant='h6' component='span' sx={{ verticalAlign: 'middle', mr: 2 }}>
            {title}
        </Typography>
    }
    return <HideOnScroll>
        <AppBar position='sticky' sx={{ boxShadow: '0px 0px 0px 0px' }} hidden={!visible}>
            <Toolbar>

                <IconButton onClick={openDrawer} size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 2 }}>
                    {title}
                    {!isMobile && buttons.left}
                </Box>

                {buttons.right}

            </Toolbar>
        </AppBar>
    </HideOnScroll>
}

function NavigationDrawer(props: ReturnType<typeof useNavigation>) {
    const { open, setOpen, buttons } = props;
    return <Drawer anchor='left' open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250, mt: 5 }}>
            <Typography variant='h6' sx={{ textAlign: 'center', mb: 3 }}>Navigation</Typography>
            <Divider orientation='horizontal' />
            <List>
                {buttons.drawer}
            </List>
        </Box>
    </Drawer>
}


// -----------------------------------------------------

function HideOnScroll(props: {
    window?: () => Window;
    children: React.ReactElement;
}) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    const [visible, setVisible] = useState(true);
    useEffect(() => {
        setVisible(!trigger);
    }, [trigger]);

    const isMobile = useMediaQuery('(max-width:600px)');

    const hover = useRef<Parameters<NonNullable<BoxProps['onMouseEnter']>>[0] | null>();
    return <>
        <Box sx={{ position: 'fixed', minHeight: isMobile ? 50 : 25, width: '100%' }}
            onMouseEnter={(event) => {
                hover.current = event;
                setTimeout(function () {
                    if (hover.current === event) {
                        setVisible(true);
                    }
                }, 100)
            }} onMouseLeave={(event) => {
                hover.current = null;
            }} onClick={() => setVisible(true)} />
        <Slide appear={false} direction="down" in={visible}>
            {children}
        </Slide>
    </>
}

function useNavigation() {
    const ctx = useContext(NavigationContext);

    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    const router = useRouter();
    const lastRoute = useRef('');

    // Hide drawer on navigation
    {
        useEffect(() => {
            setVisible(router.route != '/login' && router.route != '/denied');
            if (lastRoute.current != router.route) {
                lastRoute.current = router.route;
                if (open) {
                    setOpen(false);
                }
            }
        }, [router.route, open, setOpen]);

        useEffect(() => {
            if (lastRoute.current != router.route) {
                lastRoute.current = router.route;
                if (open) {
                    setOpen(false);
                }
            }
        }, [router.route, open, setOpen]);
    }

    const openDrawer = () => {
        setOpen(true)
    }

    // drawer link slide-in stepper
    const [transitionStep, setTransitionStep] = useState(0);

    const styles = {
        button: {
            px: 2,
            mx: 0.5
        },
        drawer: {
            width: '100%',
            pl: 8
        }
    }

    const buttons = {
        left: ctx.buttons.filter(o => o.alignment !== 'right').map((item, i) => item.type === 'button' ? (
            <NavButton {...item} index={i} sx={styles.button} key={item.url} />
        ) : (
            <NavDropdown {...item} index={i} sx={styles.button} key={item.content} />
        )),
        right: ctx.buttons.filter(o => o.alignment === 'right').map((item, i) => item.type === 'button' ? (
            <NavButton {...item} index={i} sx={styles.button} key={item.url} />
        ) : (
            <NavDropdown {...item} index={i} sx={styles.button} key={item.content} />
        )),
        drawer: ctx.buttons.map((item, i) => item.type === 'button' ? (
            <DrawerButton {...item} index={i} sx={styles.drawer} key={item.url} open={open} transitionStep={transitionStep} />
        ) : null),
    }

    // make steps slide in
    useEffect(() => {
        if (!open) return setTransitionStep(0);
        if (transitionStep <= buttons.drawer.length) {
            const tmt = setTimeout(function () {
                setTransitionStep(transitionStep + 1);
            }, (transitionStep == 0 ? 50 : 0) + 30);
            return () => clearTimeout(tmt);
        }
    }, [transitionStep, open]);

    const isMobile = useMediaQuery('(max-width:600px)');


    return {
        open,
        setOpen,
        visible,
        setVisible,
        transitionStep,
        setTransitionStep,
        openDrawer,
        isMobile,
        buttons,
    }
}

function NavButton({ url, content, visible, icon, iconPlacement, tooltip, sx }: NavigationButton & { index: number, sx: SxProps }) {
    if (typeof visible === 'function') visible = visible({ type: 'navbar' });
    if (typeof iconPlacement === 'function') iconPlacement = iconPlacement({ type: 'navbar' });

    if (icon && iconPlacement) {
        icon = { [iconPlacement + 'Icon']: icon }
    } else icon = {};

    if (visible != undefined && !visible) return <></>;

    const element = <Button color='inherit' {...icon} sx={{ ...sx, }}>
        {content}
    </Button>;

    return <Link href={url}>
        {tooltip ? <Tooltip title={tooltip} disableInteractive PopperProps={{
            modifiers: [
                { name: 'offset', options: { offset: [0, -10] } }
            ]
        }}>
            {element}
        </Tooltip> : element}
    </Link>
}

function NavDropdown({ buttons, content, visible, icon, iconPlacement, index, sx }: NavigationDropdown & { index: number, sx: SxProps }) {
    if (typeof visible === 'function') visible = visible({ type: 'navbar' });
    if (typeof iconPlacement === 'function') iconPlacement = iconPlacement({ type: 'navbar' });

    if (icon && iconPlacement) {
        icon = { [iconPlacement + 'Icon']: icon }
    } else icon = {};

    if (visible != undefined && !visible) return <></>;

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const element = <Button color='inherit' {...icon} sx={{ ...sx, }}
        onClick={(event) => setAnchorEl(event.target as any)}
        onMouseEnter={(event) => setAnchorEl(event.target as any)}>
        {content}
    </Button>;

    return <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        {element}
    </ClickAwayListener>
}

function DrawerButton({ url, content, visible, icon, iconPlacement, tooltip, index, transitionStep, open, sx }: NavigationButton & { index: number, transitionStep: number, open: boolean, sx: SxProps }) {
    if (typeof visible === 'function') visible = visible({ type: 'drawer' });

    if (visible != undefined && !visible) return <></>;

    const element = <ListItem button sx={{ ...sx, }}>
        {icon && <ListItemIcon>
            {icon}
        </ListItemIcon>}
        <ListItemText primary={content} />
    </ListItem>;

    return <Link href={url}>
        <Slide in={open && transitionStep > index} direction='right' timeout={200}>
            {tooltip ? <Tooltip title={tooltip} disableInteractive placement='right'>
                {element}
            </Tooltip> : element}
        </Slide>
    </Link>
}

// -----------------------------------------------------
