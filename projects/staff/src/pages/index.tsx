import { Box } from '@mui/material';
import { UserList, UserManagement } from '../widgets/users';


export default function StaffHomepage() {
    return <Box>
        Staff Homepage
        <Box sx={{ maxWidth: 500 }}>
            {/* <UserList mode='edit' /> */}
            <UserManagement />
        </Box>
    </Box>
}