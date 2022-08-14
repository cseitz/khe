import { zodResolver } from '@hookform/resolvers/zod';
import { Box, BoxProps, Button, TextField } from '@mui/material';
import { ContactInput, contactInput } from 'api/data/contact';
import { createContext } from 'react';
import { Controller, ControllerProps, FormProvider, useForm, useFormContext, UseFormProps, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';


// export default function ContactPage() {
//     const form = useForm<ContactInput>({

//         resolver: zodResolver(contactInput),
//         mode: 'all',
//         delayError: 1500,
//         reValidateMode: 'onBlur'
//     });

//     const { } = form.watch();

//     const { control } = form;
//     const handleSubmit = form.handleSubmit(function (data) {
//         console.log({ data })
//     });

//     const isError = false; // !form.formState.isValid;
//     const error = function (key: string) {
//         const err = form.formState?.errors?.[key]?.message;
//         return err as string | undefined;
//     }

//     return <Box component={'form'} onSubmit={handleSubmit}>

//         <Controller control={control} name='email' render={({ field }) => {
//             const err = error(field.name);
//             return <TextField {...field} fullWidth type='email' label='Email' placeholder='Enter your email address'
//                 error={!!err} helperText={err} />
//         }} />

//         <Button variant='contained' type='submit' disabled={isError}>Submit</Button>

//     </Box>
// }

function useContactForm() {
    const form = useForm<ContactInput>({
        resolver: zodResolver(contactInput),
        mode: 'all',
        delayError: 1500,
        reValidateMode: 'onBlur'
    });

    const handleSubmit = form.handleSubmit((data) => {
        console.log({ data })
    });

    const error = function (key: string) {
        const err = form.formState?.errors?.[key]?.message;
        return err as string | undefined;
    }

    // const Form = (props: BoxProps) => {
    //     const { children, ...rest } = props;
    //     return <FormProvider {...form}>
    //         <Box component={'form'} onSubmit={handleSubmit} {...rest}>
    //             {children}
    //         </Box>
    //     </FormProvider>
    // };

    // const Controll = (props: ControllerProps<ContactInput>) => {
    //     const args: ControllerProps<ContactInput> = { ...props, control: form.control };
    //     return <Controller {...args} />
    // }

    return Object.assign(form, {
        // Form,
        extra: {
            handleSubmit,
        },
        error,
        // handleSubmit,
        // Controll,
    });
}

const Formy = (props: BoxProps & { form: any, handleSubmit?: any }) => {
    const { children, form, handleSubmit, ...rest } = props;
    return <FormProvider {...form}>
        <Box component={'form'} onSubmit={handleSubmit} {...rest}>
            {children}
        </Box>
    </FormProvider>
};


export default function ContactPage() {
    const form = useContactForm();

    const { control, error, extra: { handleSubmit }, register } = form;


    const err = error('email');

    console.log('render');

    return <Formy form={form} handleSubmit={handleSubmit}>

        <TextField {...register('email', { required: true })} fullWidth type='email' label='Email' placeholder='Enter your email address'
            error={!!err} helperText={err} />

        <Button variant='contained' type='submit' disabled={false}>Submit</Button>

    </Formy>
}


// export default function ContactPage() {
//     const form = useContactForm();

//     const { control, error, extra: { handleSubmit } } = form;

//     return <Formy form={form} handleSubmit={handleSubmit}>

//         <Controller control={control} name='email' render={({ field }) => {
//             const err = error(field.name);
//             return <TextField {...field} fullWidth type='email' label='Email' placeholder='Enter your email address'
//                 error={!!err} helperText={err} />
//         }} />

//         <Button variant='contained' type='submit' disabled={false}>Submit</Button>

//     </Formy>
// }




// TODO: include FAQ on this page

// namespace TestForm {

//     type FormProps<
//         Schema extends z.AnyZodObject = any,
//         Context extends object = object
//     > = UseFormProps<z.infer<Schema>, any>
//         & {
//             schema: Schema,
//             context?: Context
//         };

//     // const FormContext = createContext<UseFormProps<any, any>>(null as any)

//     type Form<
//         Schema extends z.AnyZodObject = any,
//         Context extends object = object
//     > = UseFormReturn<z.infer<Schema>, Context>

//     export function createForm<
//         Schema extends z.AnyZodObject,
//         Context extends object = object
//     >(props: FormProps<Schema, Context>) {
//         const { schema, ...rest } = props;
//         const form = useForm<z.infer<Schema>, Context>({
//             // @ts-ignore
//             resolver: zodResolver(schema),
//             mode: 'all',
//             delayError: 1500,
//             reValidateMode: 'onBlur',
//             ...rest,
//         });

//         return form;
//     }

//     export function Form<FormReturn extends ReturnType<typeof createForm>>(props: BoxProps & { form: FormReturn }) {
//         const { form, children, ...rest } = props;
//         return <FormProvider {...form}>
//             <Box component={'form'} {...rest}>
//                 {children}
//             </Box>
//         </FormProvider>
//     }

//     function Bruh() {
//         const form = createForm({
//             schema: z.object({
//                 email: z.string().email(),
//             }),
//         })

//         type thingy = Form<ContactInput, { hi: string }>

//         return <Form form={form}>
//             hi
//         </Form>
//     }

// }


// type FormProps<Schema extends z.AnyZodObject> =
//     & BoxProps
//     & {
//         schema: Schema,
//         form?: UseFormProps<z.infer<Schema>, any>
//     }


// // const FormContext = createContext
// function Form<Props extends FormProps<any>>(props: Props) {
//     const { schema, form: _form = {}, ...rest } = props;
//     const form = useForm<z.infer<typeof schema>>({
//         resolver: zodResolver(schema),
//         mode: 'all',
//         delayError: 1500,
//         reValidateMode: 'onBlur',
//         ..._form,
//     });

//     return <Box component='form'>

//     </Box>
// }
