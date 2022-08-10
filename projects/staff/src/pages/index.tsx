import { Box } from '@mui/material';
import { What } from 'api/auth/client';
import { Navigation } from 'ui/navigation';


export default function StaffHomepage() {
    return <Box>
        <Navigation />
        Staff Homepage
        <What />
    </Box>
}