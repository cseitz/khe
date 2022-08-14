import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField } from '@mui/material';
import { ContactInput, contactInput } from 'api/data/contact';
import { api } from 'api/trpc';
import { Controller, useForm } from 'react-hook-form';


export default function ContactPage() {

    return <Box>
        <Box sx={{ mx: 'auto', width: 'min(500px, 90vw)', mt: 10 }}>
            <ContactForm />
        </Box>
        <ListTickets />
    </Box>
}

function ContactForm() {
    const form = useForm<ContactInput>({
        resolver: zodResolver(contactInput),
        mode: 'all',
        delayError: 1500,
        reValidateMode: 'onBlur'
    });

    const mutation = api.tickets.create.useMutation();
    const createTicket = mutation.mutate;

    const { control, register } = form;
    const handleSubmit = form.handleSubmit((data) => {
        console.log({ data })
        createTicket(data)
    });

    const isError = false; // !form.formState.isValid;
    const error = function (key: string) {
        const err = form.formState?.errors?.[key]?.message;
        return err as string | undefined;
    }

    return <Box component={'form'} onSubmit={handleSubmit} sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
    }}>

        <TextField {...register('email')}
            fullWidth type='email' label='Email'
            placeholder='Enter your email address'
            error={!!error('email')} helperText={error('email')}
        />

        <TextField {...register('name')}
            fullWidth label='Name'
            placeholder='Enter your name'
            error={!!error('name')} helperText={error('name')}
        />

        <TextField {...register('subject')}
            fullWidth label='Subject'
            placeholder="What do you need to talk about?"
            error={!!error('subject')} helperText={error('subject')}
        />

        <TextField {...register('message')}
            multiline minRows={4} fullWidth label='Message'
            placeholder="Details"
            error={!!error('message')} helperText={error('message')}
        />

        {/* <Controller control={control} name='email' render={({ field }) => {
            const err = error(field.name);
            return <TextField {...field} fullWidth type='email' label='Email' placeholder='Enter your email address'
                error={!!err} helperText={err} />
        }} /> */}

        <Button fullWidth variant='contained' type='submit' disabled={isError} sx={{ mx: 'auto', maxWidth: 200 }}>Submit</Button>

    </Box>
}

function ListTickets() {
    const query = api.tickets.list.useQuery({});
    return <Box>
        {JSON.stringify(query?.data || {})}
    </Box>
}
