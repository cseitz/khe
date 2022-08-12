import { ContextType } from 'react';
import { Navigation, NavigationContext } from 'ui/widgets/navigation';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventNote from '@mui/icons-material/EventNote';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { isAuthenticated, isReturningUser } from 'api/auth';


const NavigationConfig: ContextType<typeof NavigationContext> = {
    title: 'Kent Hack Enough',
    buttons: [
        {
            type: 'button',
            url: '/',
            content: 'Home',
            tooltip: `See details about the hackathon!`,
            icon: <HomeIcon />
        },
        {
            type: 'button',
            url: '/#faq',
            content: 'FAQ',
            tooltip: `Have a question? See if it's already answered in our FAQ!`,
            icon: <LiveHelpIcon />
        },
        {
            type: 'button',
            url: '/events',
            content: 'Schedule',
            tooltip: `View our schedule and sign up for workshops and other activities!`,
            icon: <EventNote />
        },
        {
            type: 'button',
            url: '/contact',
            content: 'Contact',
            tooltip: `Need something else? Contact us!`,
            icon: <ContactSupportIcon />
        },
        {
            type: 'dropdown',
            content: 'Dropdown',
            alignment: 'right',
            icon: <KeyboardArrowDownIcon />,
            buttons: [
                { type: 'button', content: 'Test', url: '/test', tooltip: 'bruh', icon: <ContactSupportIcon /> },
                { type: 'button', content: 'What', url: '/what', icon: <ContactSupportIcon /> }
            ]
        },
        {
            type: 'button',
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
            type: 'button',
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
            type: 'button',
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