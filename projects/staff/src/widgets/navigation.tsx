import { ContextType } from 'react';
import { Navigation, NavigationContext } from 'ui/navigation';
import HomeIcon from '@mui/icons-material/Home';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
// import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventNote from '@mui/icons-material/EventNote';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';


const NavigationConfig: ContextType<typeof NavigationContext> = {
    title: 'Staff Portal',
    buttons: [
        {
            url: '/',
            content: 'Home',
            icon: <HomeIcon />
        },
        {
            url: '/events',
            content: 'Events',
            icon: <EventNote />
        },
        {
            url: '/tickets',
            content: 'Tickets',
            icon: <ContactSupportIcon />
        },
        {
            url: '/website',
            content: 'Website',
            icon: <DriveFileRenameOutlineIcon />
        },
        {
            url: '/exports',
            content: 'Exports',
            icon: <HomeIcon />,
        },
        {
            url: '/logout',
            content: 'Logout',
            alignment: 'right',
            icon: <ExitToAppIcon />,
            iconPlacement: 'end',
        },
    ]
}

export default function NavigationProvider(props: { children: any }) {
    return <NavigationContext.Provider value={NavigationConfig}>
        <Navigation />
        {props.children}
    </NavigationContext.Provider>
}