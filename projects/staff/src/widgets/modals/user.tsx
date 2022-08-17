import { Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { Authentication } from 'api/auth';
import { UserRole } from 'api/data/user';
import { api } from 'api/trpc';
import { useState } from 'react';
import { buildModal, useModal } from 'ui/widgets/modal';
import { Enum } from 'utils/enum';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';


export const UserEditModal = buildModal((props: { email: string }) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const isEditing = mode === 'edit';
    const isViewing = mode === 'view';

    const self = useModal(UserEditModal);

    const me = Authentication.useMe();

    const query = api.users.get.useQuery({ email: props.email });
    const { user } = query.data || {};
    if (!me || !user || !user.info) return <></>;

    const isAdmin = user.role === UserRole.Admin;
    const canEdit = isAdmin || Enum.index(UserRole, me.role) >= Enum.index(UserRole, user.role);

    const saveChanges = function () {
        setMode('view');
    }

    const discardChanges = function () {
        setMode('view');
    }

    const topActions = <>
        {canEdit && !isEditing && <Tooltip title="Edit" placement='left' disableInteractive>
            <IconButton onClick={() => setMode('edit')}>
                <EditIcon />
            </IconButton>
        </Tooltip>}
        {isAdmin && isEditing && <Tooltip title="Delete" placement="left" disableInteractive>
            <IconButton onClick={() => alert('delete')}>
                <DeleteIcon />
            </IconButton>
        </Tooltip>}
        {!isEditing && <Tooltip title="Close" placement="left" disableInteractive>
            <IconButton onClick={() => self.close()}>
                <ClearIcon />
            </IconButton>
        </Tooltip>}
    </>

    return <Box sx={{ maxWidth: 600, mx: 'auto', mt: '10vh', px: 1 }}>
        <Card sx={{ p: 2 }} onDoubleClick={() => {
            if (!isEditing && canEdit) {
                setMode('edit');
                document.getSelection()?.empty();
            }
        }}>
            <CardHeader subheader={user.email}
                title={user.info.firstName + ' ' + user.info.lastName}
                action={topActions}
            />
            <CardContent>
                User {user.email}, {mode}

                {mode == 'edit' ? <Edit /> : <View />}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
                {/* {isViewing && canEdit && <>
                    <Button onClick={() => setMode('edit')} startIcon={<EditIcon />}>Edit</Button>
                </>} */}
                {isEditing && <>
                    <Button onClick={() => saveChanges()} startIcon={<CheckIcon />}>Save Changes</Button>
                    <Button onClick={() => discardChanges()} startIcon={<ClearIcon />}>Discard Changes</Button>
                </>}
            </CardActions>

        </Card>
    </Box>
})


function View() {

    return <Box>
        View Mode
    </Box>
}

function Edit() {

    return <Box>
        Edit Mode
    </Box>
}

