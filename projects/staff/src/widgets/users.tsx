import { Box, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Api, api } from 'api/trpc';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import { ContextType, createContext, useContext } from 'react';

export function UserManagement() {

    return <Box>
        <UserList filter={{ search: 'chris' }} />
    </Box>
}


const UserListContext = createContext<{
    mode: 'checkin' | 'edit'

    /** Disables query fetching. Data relies on other components populating query data. */
    cached?: boolean

    dense?: boolean
    disablePadding?: boolean
}>({
    mode: 'edit'
})

type PartialContext = Partial<ContextType<typeof UserListContext>>
export function UserList(props: { filter?: inferProcedureInput<Api['users']['list']> }
    & PartialContext
) {
    const { filter = {}, ...rest } = props;
    const queryClient = useQueryClient();
    const query = api.users.list.useQuery(filter, {
        onSuccess(data) {
            for (const user of data.users) {
                queryClient.setQueryData<inferProcedureOutput<Api['users']['get']>>
                    (['users.get', { email: user.email }], { user });
            }

        }
    });

    return <UserListContext.Provider value={{
        mode: 'edit',
        cached: true,
        disablePadding: true,
        ...rest,
    }}>
        <Box>
            {query.data && <List>
                {query.data.users.map((user) => (
                    <UserListItem email={user.email} />
                ))}
                {query.data.users.map((user) => (
                    <UserListItem email={user.email} />
                ))}
                {query.data.users.map((user) => (
                    <UserListItem email={user.email} />
                ))}
            </List>}
        </Box>
    </UserListContext.Provider>
}


function UserListItem(props: inferProcedureInput<Api['users']['get']> & {
    /** Disables query fetching. Data relies on other components populating query data. */
    cached?: boolean
}) {
    const {
        dense = false,
        cached: _cached = false,
        disablePadding = false,
    } = useContext(UserListContext);
    const {
        email,
        cached = _cached,
    } = props;

    const query = api.users.get.useQuery({ email }, {
        enabled: !cached,
    });

    const { user } = query.data || {};
    if (!user || !user.info) return <></>;

    const openModal = () => {
        alert('Open Modal')
    }

    const mode = 'checkin';

    const secondaryAction = <Grid container spacing={2}>
        {/* <Grid item xs={6}>
            <ListItemText primary={user.role[0].toUpperCase() + user.role.slice(1)} secondary={user.status} />
        </Grid>
        <Grid item xs={6}>
            <ListItemText primary={user.role[0].toUpperCase() + user.role.slice(1)} secondary={user.status} />
        </Grid> */}
    </Grid>

    const primary = <>
        {[user.info.firstName, user.info.lastName].filter(o => o).join(' ')}
        <Typography component="span" sx={{ color: 'text.disabled', m: 1 }}>-</Typography>
        <Typography component="span" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
    </>;

    const secondary = <>
        <Typography component="span">
            Registered on {Intl.DateTimeFormat('default', {
                dateStyle: 'short',
                timeStyle: 'short'
            }).format(new Date(user.created))}
        </Typography>
    </>

    return <ListItem disablePadding={disablePadding} onClick={openModal} secondaryAction={secondaryAction}>
        <ListItemButton dense={dense}>
            <ListItemText primary={primary} secondary={secondary} />
        </ListItemButton>
    </ListItem>
}