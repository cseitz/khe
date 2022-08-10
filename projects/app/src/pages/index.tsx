import { Box } from '@mui/material';
import { hi } from 'api';
import { What } from 'api/auth/client';
import { Navigation } from 'ui/navigation';

export default function Bruh() {
    return <Box>
        <Navigation />
        <What />
        {hi}
    </Box>
}