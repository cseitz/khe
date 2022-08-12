import { AppBar, Box, BoxProps, Button, ClickAwayListener, Collapse, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemButtonProps, ListItemIcon, ListItemProps, ListItemText, Menu, MenuItem, Slide, SxProps, Toolbar, Tooltip, TooltipProps, Typography, useMediaQuery, useScrollTrigger } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createContext, MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu'

/** @export 'widgets/navigation' */

// -----------------------------------------------------

type CTX = {
    type: 'navbar' | 'drawer',
    open: boolean,
    transitionStep: number,
}
type NavigationComputed<R> = R | ((ctx: CTX) => R);

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
    const { visible, openDrawer, isMobile, buttons, open, transitionStep } = props;
    let { title } = useContext(NavigationContext);
    if (title && typeof title === 'string') {
        title = <Typography variant='h6' component='span' sx={{ verticalAlign: 'middle', mr: 2 }}>
            {title}
        </Typography>
    }
    return <NavContext.Provider value={{ type: 'navbar', open, transitionStep }}>
        <HideOnScroll>
            <AppBar position='sticky' sx={{ boxShadow: '0px 0px 0px 0px' }} hidden={!visible}>
                <Toolbar>

                    <IconButton onClick={openDrawer} size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 2 }} suppressHydrationWarning>
                        {title}
                        {!isMobile && buttons.left}
                    </Box>

                    {buttons.right}

                </Toolbar>
            </AppBar>
        </HideOnScroll>
    </NavContext.Provider>
}

function NavigationDrawer(props: ReturnType<typeof useNavigation>) {
    const { open, setOpen, buttons, transitionStep } = props;

    return <NavContext.Provider value={{ type: 'drawer', open, transitionStep }}>
        <Drawer anchor='left' open={open} onClose={() => setOpen(false)}>
            <Box sx={{ width: 250, mt: 5 }}>
                <Typography variant='h6' sx={{ textAlign: 'center', mb: 3 }}>Navigation</Typography>
                <Divider orientation='horizontal' />
                <List>
                    {buttons.drawer}
                </List>
            </Box>
        </Drawer>
    </NavContext.Provider>
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

const NavContext = createContext<CTX>(null as any);
const EntryContext = createContext<NavigationEntry & { sx: SxProps, index: number, inner?: boolean }>(null as any);

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
        left: ctx.buttons.filter(o => o.alignment !== 'right').map((item, index) => item.type === 'button' ? (
            <EntryContext.Provider value={{ ...item, index, sx: styles.button }} key={index}>
                <Compose.Bar.Button />
            </EntryContext.Provider>
        ) : (
            <EntryContext.Provider value={{ ...item, index, sx: styles.button }} key={index}>
                <Compose.Bar.Dropdown />
            </EntryContext.Provider>
        )),
        right: ctx.buttons.filter(o => o.alignment === 'right').map((item, index) => item.type === 'button' ? (
            <EntryContext.Provider value={{ ...item, index, sx: styles.button }} key={index}>
                <Compose.Bar.Button />
            </EntryContext.Provider>
        ) : (
            <EntryContext.Provider value={{ ...item, index, sx: styles.button }} key={index}>
                <Compose.Bar.Dropdown />
            </EntryContext.Provider>
        )),
        // drawer: ctx.buttons.map((item, i) => item.type === 'button' ? (
        //     <DrawerButton {...item} index={i} sx={styles.drawer} key={item.url} open={open} transitionStep={transitionStep} />
        // ) : null),
        drawer: ctx.buttons.map((item, index) => item.type === 'button' ? (
            <EntryContext.Provider value={{ ...item, index, sx: styles.drawer }} key={index}>
                <Compose.Drawer.Button />
            </EntryContext.Provider>
        ) : (
            <EntryContext.Provider value={{ ...item, index, sx: styles.drawer }} key={index}>
                <Compose.Drawer.Dropdown />
            </EntryContext.Provider>
        )),
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

const [
    MuiTooltip,
    MuiButton,
    NextLink,
] = [
        Tooltip,
        Button,
        Link,
    ];
namespace Compose {
    type Props = { children: JSX.Element }

    export function Tooltip({ children, ...props }: Props & Partial<TooltipProps>) {
        const ctx = useContext(NavContext);
        const entry = useContext(EntryContext);
        const { type } = entry;
        if (type === 'button' && entry.tooltip) {
            return <MuiTooltip title={entry.tooltip} disableInteractive PopperProps={{
                modifiers: [
                    { name: 'offset', options: { offset: [0, -10] } }
                ],
                sx: { textAlign: 'center', maxWidth: ctx.type === 'navbar' ? '200px' : '300px' }
            }} {...props}>
                {children}
            </MuiTooltip>
        }
        return children;
    }

    export function Link({ children }: Props) {
        const entry = useContext(EntryContext);
        const { type } = entry;
        if (type === 'button') {
            return <NextLink href={entry.url}>
                <a style={{ color: 'inherit', textDecoration: 'none' }}>
                    {children}
                </a>
            </NextLink>
        }
        return children;
    }

    export function Visible({ children }: Props) {
        const ctx = useContext(NavContext);
        const entry = useContext(EntryContext);
        let { visible } = entry;
        if (typeof visible === 'function') visible = visible(ctx);
        if (visible != undefined && !visible) return <></>;
        return children;
    }

    export namespace Bar {

        export function Button() {
            const ctx = useContext(NavContext);
            const entry = useContext(EntryContext);
            const { content, inner = false, sx } = entry;

            let { icon, iconPlacement } = entry;
            if (typeof iconPlacement === 'function') iconPlacement = iconPlacement(ctx);
            if (icon && iconPlacement) {
                icon = { [iconPlacement + 'Icon']: icon }
            } else icon = {};

            const element = <MuiButton color='inherit' {...icon} sx={{ ...sx, }}>
                {content}
            </MuiButton>;

            return <Visible>
                <Link>
                    <Tooltip>
                        <>
                            {element}
                        </>
                    </Tooltip>
                </Link>
            </Visible>
        }

        export function Dropdown() {
            const ctx = useContext(NavContext);
            const entry = useContext(EntryContext);
            if (entry.type !== 'dropdown') return <></>
            const { content, buttons, sx } = entry;

            let { icon, iconPlacement } = entry;
            if (typeof iconPlacement === 'function') iconPlacement = iconPlacement(ctx);
            if (icon && iconPlacement) {
                icon = { [iconPlacement + 'Icon']: icon }
            } else icon = {};

            const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
            const open = Boolean(anchorEl);

            const handleClose = () => {
                if (open) setAnchorEl(null);
            }
            const handleOpen = (event: any) => {
                if (!open) setAnchorEl(event.target);
            };
            const handleMove = (event: any) => {
                if (!anchorEl) return;
                const relative = event.clientX - anchorEl.offsetLeft;
                if (relative <= 0 || relative >= anchorEl.offsetWidth) {
                    handleClose();
                }
                // console.log('mouse move', relative)
            }

            const button = <MuiButton color='inherit' {...icon} sx={{ ...sx, }}
                onClick={handleOpen}
                onMouseEnter={handleOpen}>
                {content}
            </MuiButton>;

            const menu = <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{
                onMouseLeave: handleClose,
            }} componentsProps={{
                backdrop: {
                    onMouseMove: handleMove,
                },
            }} onMouseLeave={handleClose} MenuListProps={{

            }} disablePortal keepMounted anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom',
            }} transformOrigin={{
                horizontal: 'center',
                vertical: 'top'
            }}>
                {buttons.map((item, index) => {
                    return <EntryContext.Provider value={{ ...item, index, sx, inner: true }} key={index}>
                        <Tooltip>
                            <Link>
                                <MenuItem sx={{ minWidth: 100, justifyContent: 'center' }} onClick={handleClose}>
                                    {item.content}
                                </MenuItem>
                            </Link>
                        </Tooltip>
                    </EntryContext.Provider>
                })}
            </Menu>;

            return <Visible>
                <ClickAwayListener onClickAway={handleClose}>
                    <>
                        {button}
                        {menu}
                    </>
                </ClickAwayListener>
            </Visible>
        }

    }


    export namespace Drawer {

        function Item({ children, ...props }: Props & Partial<ListItemButtonProps>) {
            const ctx = useContext(NavContext);
            const { open, transitionStep } = ctx;
            const entry = useContext(EntryContext);
            const { index } = entry;

            let { icon, iconPlacement } = entry;
            if (typeof iconPlacement === 'function') iconPlacement = iconPlacement(ctx);

            return <Slide in={open && transitionStep > index} direction='right' timeout={200}>
                <ListItemButton {...props}>
                    {icon && <ListItemIcon>{icon}</ListItemIcon>}
                    {children}
                </ListItemButton>
                {/* <ListItem button {...props}> */}
                    {/* {icon && <ListItemIcon>{icon}</ListItemIcon>} */}
                    {/* {icon && iconPlacement === 'start' && <ListItemIcon>{icon}</ListItemIcon>} */}
                    {/* {children} */}
                    {/* {icon && iconPlacement === 'end' && <ListItemIcon>{icon}</ListItemIcon>} */}
                    {/* {icon && <ListItemIcon>{icon}</ListItemIcon>} */}
                {/* </ListItem> */}
            </Slide>
        }

        export function Button(props: Partial<ListItemButtonProps>) {
            const entry = useContext(EntryContext);
            const { content, inner = false, sx } = entry;

            return <Link>
                <Item {...props}>
                    <Tooltip placement='right'>
                        <ListItemText>{content}</ListItemText>
                    </Tooltip>
                </Item>
            </Link>
        }

        export function Dropdown() {
            const ctx = useContext(NavContext);
            const entry = useContext(EntryContext);
            if (entry.type !== 'dropdown') return <></>
            const { content, buttons, sx } = entry;

            const [open, setOpen] = useState(false);
            const [showBottomDivider, setShowBottomDivider] = useState(false);
            useEffect(() => {
                if (open) {
                    setShowBottomDivider(true);
                }
            }, [open]);

            const menu = <Collapse in={open} onExited={() => {
                setShowBottomDivider(false);
            }}>
                <Divider orientation='horizontal' />
                <List>
                    {buttons.map((item, index) => (
                        <EntryContext.Provider value={{ ...item, index, sx, inner: true }} key={index}>
                            <Button sx={{ pl: 4 }} />
                        </EntryContext.Provider>
                    ))}
                </List>
            </Collapse>;

            return <>
                <Item onClick={() => setOpen(!open)}>
                    <ListItemText>{content}</ListItemText>
                </Item>
                {menu}
                {showBottomDivider && <Divider orientation='horizontal' />}
            </>
        }

    }

}

// -----------------------------------------------------
