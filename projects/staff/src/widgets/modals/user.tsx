import { Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { Authentication } from 'api/auth';
import { UserData, userData, UserInfo, UserRole } from 'api/data/user';
import { Api, api } from 'api/trpc';
import { ContextType, createContext, useContext, useEffect, useState } from 'react';
import { buildModal, useModal } from 'ui/widgets/modal';
import { Enum } from 'utils/enum';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller, FieldPath, FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import { useQueryClient } from '@tanstack/react-query';
import { get } from 'lodash';
import { ZodUtils } from 'utils/zod';

console.log(ZodUtils);


type EditData = z.infer<typeof editData>;
const editData = userData.pick({
    email: true,
    role: true,
    status: true,
}).merge(z.object({
    info: UserInfo.info.pick({
        firstName: true,
        lastName: true,
    })
}))


type UserEditContext = ContextType<typeof UserEditContext>;
const UserEditContext = createContext<{
    filter: inferProcedureInput<Api['users']['get']>,
    user: UserData,
    me: UserData,
}>(null as any);




export const UserEditModal = buildModal((props: { email: string }) => {
    const self = useModal(UserEditModal);
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const isEditing = mode === 'edit';
    const isViewing = mode === 'view';

    const me = Authentication.useMe();

    const filter: UserEditContext['filter'] = { email: props.email }
    const query = api.users.get.useQuery(filter);
    const { user } = query.data || {};

    const defaultValues = user as NonNullable<typeof user>;
    const form = useForm<EditData>({
        resolver: zodResolver(editData),
        defaultValues,
    });

    useEffect(() => {
        if (mode != 'edit' && user && !form.formState.isDirty) {
            // @ts-ignore
            form.reset(user)
        }
    }, [mode, query.dataUpdatedAt]);

    if (!me || !user || !user.info) return <></>;

    const isAdmin = user.role === UserRole.Admin;
    // @ts-ignore
    const canEdit = true || isAdmin || Enum.index(UserRole, me.role) > Enum.index(UserRole, user.role);


    const saveChanges = function () {
        form.reset(form.getValues());
        setMode('view');
    }

    const discardChanges = function () {
        form.reset();
        console.log(form.getValues());
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

    return <UserEditContext.Provider value={{ filter, user, me }}>
        <FormProvider {...form}>

            <Box sx={{ maxWidth: 600, mx: 'auto', mt: '10vh', px: 1 }}>
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
                        {isEditing && <>
                            <Button onClick={() => saveChanges()} startIcon={<CheckIcon />}>Save Changes</Button>
                            <Button onClick={() => discardChanges()} startIcon={<ClearIcon />}>Discard Changes</Button>
                        </>}
                    </CardActions>

                </Card>
            </Box>

        </FormProvider>
    </UserEditContext.Provider>
})



namespace Field {
    export function Role() {
        const form = useFormContext<EditData>();
        const { user, me } = useContext(UserEditContext);

        const myRoleIndex = Enum.index(UserRole, me.role);
        const userRoleIndex = Enum.index(UserRole, user.role);

        const _roles = Object.entries(UserRole);
        const [allowedRoles, disallowedRoles] = me.role === UserRole.Admin ? [_roles, []] : [
            _roles.slice(0, myRoleIndex),
            _roles.slice(myRoleIndex),
        ];

        return <Controller control={form.control} name='role' render={({ field }) => (
            <Select {...field}>
                {allowedRoles.map(([title, value]) => (
                    <MenuItem value={value} key={value}>{title}</MenuItem>
                ))}
                {disallowedRoles.map(([title, value]) => (
                    <MenuItem value={value} key={value} disabled>{title}</MenuItem>
                ))}
            </Select>
        )} />
    }
}

function useFieldAutoSave(field: FieldPath<EditData>) {
    const form = useFormContext<EditData>();
    const { user } = useContext(UserEditContext);

    const queryClient = useQueryClient();
    const mutation = api.users.update.useMutation({
        onSuccess() {
            queryClient.invalidateQueries(['users.get', { email: user.email }]);
        }
    });

    const value = form.watch(field);
    useEffect(() => {
        if (!form.formState.isDirty) return;
        if (get(user, field) != value) {
            mutation.mutate({
                email: user.email,
                data: {
                    [field]: value,
                    // ["info.age"]: 'ok'
                }
            });
        }
    }, [user, value]);
}

// type bruh = z.infer<typeof thing>;
// const thing = ZodUtils.toPaths(userData.pick({
//     email: true,
//     role: true,
//     status: true,
//     info: true,
// }).required());

function View() {
    const form = useFormContext<EditData>();
    const { user } = useContext(UserEditContext);

    useFieldAutoSave('role');
    useFieldAutoSave('status');

    return <Box>
        View Mode, {JSON.stringify(form.getValues())}
        <Field.Role />
    </Box>
}

function Edit() {
    const form = useFormContext<EditData>();

    return <Box>
        Edit Mode, {JSON.stringify(form.getValues())}
        <TextField {...form.register('info.firstName')} label="First Name" />
        <Field.Role />
    </Box>
}

