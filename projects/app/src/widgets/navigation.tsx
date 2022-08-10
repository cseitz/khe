import { ContextType } from 'react';
import { Navigation, NavigationContext } from 'ui/navigation';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventNote from '@mui/icons-material/EventNote';
import { isAuthenticated, isReturningUser } from 'api/auth';


const NavigationConfig: ContextType<typeof NavigationContext> = {
    title: 'KHE',
    buttons: [
        {
            url: '/',
            content: 'Home',
            icon: <HomeIcon />
        },
        {
            url: '/#faq',
            content: 'FAQ',
            icon: <LiveHelpIcon />
        },
        {
            url: '/events',
            content: 'Events',
            icon: <EventNote />
        },
        {
            url: '/contact',
            content: 'Contact',
            icon: <ContactSupportIcon />
        },
        {
            url: '/login',
            content: 'Login',
            alignment: 'right',
            icon: <LoginIcon />,
            iconPlacement: 'end',
            visible() {
                return !isAuthenticated() && isReturningUser();
            }
        },
        {
            url: '/register',
            content: 'Register',
            alignment: 'right',
            icon: <HowToRegIcon />,
            iconPlacement: 'end',
            visible() {
                return !isAuthenticated() && !isReturningUser();
            }
        },
        {
            url: '/logout',
            content: 'Logout',
            alignment: 'right',
            icon: <ExitToAppIcon />,
            iconPlacement: 'end',
            visible() {
                return !!isAuthenticated();
            }
        },
    ]
}

export default function NavigationProvider(props: { children: any }) {
    return <NavigationContext.Provider value={NavigationConfig}>
        <Navigation />
        {props.children}
    </NavigationContext.Provider>
}