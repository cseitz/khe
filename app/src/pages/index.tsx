import { Box } from '@mui/material';
import { hi } from 'api';
import { What } from 'api/auth/client';

export default function Bruh() {
    return <Box>
        <What />
        {hi}
    </Box>
}