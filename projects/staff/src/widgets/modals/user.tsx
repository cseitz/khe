import { Box, Button, Card, CardHeader } from '@mui/material';
import { api } from 'api/trpc';
import { useState } from 'react';
import { buildModal } from 'ui/widgets/modal';


export const UserEditModal = buildModal((props: { email: string }) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');

    const query = api.users.get.useQuery({ email: props.email });
    const { user } = query.data || {};
    if (!user || !user.info) return <></>;

    return <Box sx={{ maxWidth: 600, mx: 'auto', mt: '10vh', px: 1 }}>
        <Card sx={{ p: 2 }}>
            <CardHeader subheader={user.email}
                title={user.info.firstName + ' ' + user.info.lastName}
            />
            User {user.email}, {mode}
            <Button onClick={() => setMode(mode == 'edit' ? 'view' : 'edit')}>
                Toggle
            </Button>
        </Card>
    </Box>
})

