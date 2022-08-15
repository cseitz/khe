import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, Link, TextField, Typography } from '@mui/material';
import { Authentication } from 'api/auth';
import { staffRegisterInput, StaffRegisterInput } from 'api/data/register';
import { loginInput, LoginInput } from 'api/data/login';
import { api } from 'api/trpc';
import { get } from 'lodash';
import Head from 'next/head';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
    const [tab, setTab] = useState<'register' | 'login'>('login');
    return <Box>

        <Head>
            <title>{tab == 'login' ? 'Login' : 'Register'}</title>
        </Head>

        <Box sx={{ margin: 'auto', width: 'min(400px, 80vw)', text_align: 'center', mt: 20 }}>

            <Typography variant='h4' sx={{ textAlign: 'center' }}>
                {tab == 'login' ? 'Login' : 'Register'}
            </Typography>

            <Box sx={{ py: 3 }}>
                {tab === 'login' ? <LoginForm /> : <RegisterForm />}
            </Box>

            <Link onClick={() => setTab(tab == 'register' ? 'login' : 'register')}>
                <Typography sx={{ cursor: 'pointer', textAlign: 'center' }}>
                    {tab == 'login' ? 'Create Account' : 'Login'}
                </Typography>
            </Link>

        </Box>

        <ShowMe />

    </Box>
}

function ShowMe() {
    const me = Authentication.useMe();
    return <Box>
        {JSON.stringify(me.data || {})}
    </Box>
}


function LoginForm() {
    const form = useForm<LoginInput>({
        resolver: zodResolver(loginInput),
        mode: 'all',
        delayError: 1500,
        reValidateMode: 'onBlur'
    });

    const mutation = Authentication.useLogin({
        onError(error) {
            const { data: { code }, message } = error;
            if (code === 'NOT_FOUND') {
                form.setError('email', {
                    message,
                })
            } else if (code === 'FORBIDDEN') {
                form.setError('password', {
                    message,
                })
            }
        }
    });
    const login = mutation.mutate;

    const { formState, register } = form;
    const handleSubmit = form.handleSubmit((data) => {
        login(data);
    });

    const error = function (key: Parameters<typeof register>[0]) {
        const err = get(formState?.errors || {}, key)?.message;
        return err as string | undefined;
    }

    const disabled = [!formState.isValid, mutation.isLoading].find(o => o);

    return <Grid container spacing={2} component='form' onSubmit={handleSubmit}>

        <Grid item xs={12}>
            <TextField {...register('email')}
                fullWidth type='email' label='Email'
                placeholder='Enter your email address'
                error={!!error('email')} helperText={error('email')}
            />
        </Grid>

        <Grid item xs={12}>
            <TextField {...register('password')}
                fullWidth type='password' label='Password'
                placeholder='Enter your password'
                error={!!error('password')} helperText={error('password')}
            />
        </Grid>

        <Grid item xs={12}>
            <Button variant='contained' type='submit' fullWidth disabled={disabled}>Login</Button>
        </Grid>

    </Grid>
}


function RegisterForm() {
    const form = useForm<StaffRegisterInput>({
        resolver: zodResolver(
            staffRegisterInput.refine((data) => data.password === data.confirm, {
                message: `Passwords don't match`,
                path: ['confirm']
            })
        ),
        mode: 'all',
        delayError: 1500,
        reValidateMode: 'onBlur'
    });

    const { formState, register } = form;

    const mutation = api.users.registerStaff.useMutation();
    const createAccount = mutation.mutate;

    const handleSubmit = form.handleSubmit(data => {
        createAccount(data);
    })

    const error = function (key: Parameters<typeof register>[0]) {
        const err = get(formState?.errors || {}, key)?.message;
        return err as string | undefined;
    }

    const disabled = [!formState.isValid, mutation.isLoading].find(o => o);

    return <Grid container spacing={2} component='form' onSubmit={handleSubmit}>

        <Grid item xs={6}>
            <TextField {...register('info.firstName')}
                fullWidth label='First Name'
                placeholder='First Name'
                error={!!error('info.firstName')} helperText={error('info.firstName')}
            />
        </Grid>

        <Grid item xs={6}>
            <TextField {...register('info.lastName')}
                fullWidth label='Last Name'
                placeholder='Last Name'
                error={!!error('info.lastName')} helperText={error('info.lastName')}
            />
        </Grid>

        <Grid item xs={12}>
            <TextField {...register('email')}
                fullWidth type='email' label='Email'
                placeholder='Enter your email address'
                error={!!error('email')} helperText={error('email')}
            />
        </Grid>

        <Grid item xs={12}>
            <TextField {...register('password')}
                fullWidth type='password' label='Password'
                placeholder='Enter a password'
                error={!!error('password')} helperText={error('password')}
            />
        </Grid>

        <Grid item xs={12}>
            <TextField {...register('confirm')}
                fullWidth type='password' label='Confirm Password'
                placeholder='Enter the password again'
                error={!!error('confirm')} helperText={error('confirm')}
            />
        </Grid>

        <Grid item xs={12}>
            <Button variant='contained' type='submit' fullWidth disabled={disabled}>Register</Button>
        </Grid>

    </Grid>
}