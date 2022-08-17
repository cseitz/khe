import { Box, Button } from '@mui/material';
import { UserList } from '../widgets/users';


export default function CheckinPage() {
    return <Box>
        <UserList mode='checkin' />
    </Box>
}
