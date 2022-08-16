import { Box } from '@mui/material';
import { Authentication } from 'api/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';


export default function LogoutPage() {
    const router = useRouter();
    const mutation = Authentication.useLogout({
        onSuccess() {
            router.push('/login');
        },
        onError() {
            router.back();
        }
    });
    useEffect(() => {
        mutation.mutate();
    }, [])
    return <>
        <ShowMe />
    </>
}

function ShowMe() {
    const me = Authentication.useMe();
    return <Box>
        {JSON.stringify(me.data || {})}
    </Box>
}