import { ContextType } from 'react';
import { Navigation, NavigationContext } from 'ui/widgets/navigation';
import HomeIcon from '@mui/icons-material/Home';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
// import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventNote from '@mui/icons-material/EventNote';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useRouter } from 'next/router';


const NavigationConfig: ContextType<typeof NavigationContext> = {
    title: 'Staff Portal',
    buttons: [
        {
            type: 'button',
            url: '/',
            content: 'Home',
            icon: <HomeIcon />
        },
        {
            type: 'button',
            url: '/tickets',
            content: 'Tickets',
            icon: <ContactSupportIcon />
        },
        {
            type: 'button',
            url: '/schedule',
            content: 'Schedule',
            icon: <EventNote />
        },
        {
            type: 'button',
            url: '/website',
            content: 'Website',
            icon: <DriveFileRenameOutlineIcon />
        },
        {
            type: 'button',
            url: '/exports',
            content: 'Exports',
            icon: <HomeIcon />,
        },
        {
            type: 'button',
            url: '/logout',
            content: 'Logout',
            alignment: 'right',
            icon: <ExitToAppIcon />,
            iconPlacement: 'end',
        },
    ]
}

export default function NavigationProvider(props: { children: any }) {
    const router = useRouter();
    const show = !(
        router.pathname.startsWith('/login')
        || router.pathname.startsWith('/logout')
    );
    return <NavigationContext.Provider value={NavigationConfig}>
        {show && <Navigation />}
        {props.children}
    </NavigationContext.Provider>
}