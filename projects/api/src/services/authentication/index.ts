import { inferAsyncReturnType, TRPCError } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { compare } from 'bcrypt';
import { z } from 'zod';
import { registerInput, staffRegisterInput } from '../../data/input/register';
import { UserRole, UserStatus } from '../../data/models/user';
import { User, Users } from '../../models/user';
import { t } from '../../trpc/index';
import { AUTH_COOKIE } from './constants';
import { AuthenticationError } from './error';
import { Session } from './session';


const Error = AuthenticationError;

export namespace Authentication {
    export type Meta = {

    }

    export type Context = inferAsyncReturnType<typeof createContext>;
    export async function createContext({ req, res }: CreateNextContextOptions) {
        if (req.headers.authorization) {
            return {
                token: req.headers['authorization']
            }
        } else if (req.cookies[AUTH_COOKIE]) {
            return {
                token: req.cookies[AUTH_COOKIE]
            }
        }
        return {}
    }


    export const router = t.router({

        login: t.procedure
            .input(z.object({
                email: z.string().email(),
                password: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const { email, password } = input;

                const user = await Users.get({ email });

                if (!user || !user?.password) {
                    throw Error.NotFound(email);
                }
                if (!await compare(password, user.password)) {
                    throw Error.IncorrectPassword(email);
                }

                // TODO: setup session
            }),

        logout: t.procedure
            .mutation(async ({ ctx }) => {

            }),


        /** Retrieves your own user */
        me: t.procedure
            .query(async ({ ctx }) => {

            }),

        /** Checks if an email is taken */
        email: t.procedure
            .input(z.object({ email: z.string().email() }))
            .query(async ({ input, ctx }) => {
                const { email } = input;
                if (await Users.get(email)) {
                    return true;
                }
                return false;
            }),


        /** Creates an account */
        register: t.procedure
            .input(
                (
                    z.object({
                        type: z.enum(['user']),
                    }).merge(registerInput)
                ).or(
                    z.object({
                        type: z.enum(['staff']),
                    }).merge(staffRegisterInput)
                )
            ).mutation(async ({ input, ctx }) => {
                const { type, email, password } = input;
                let user: User.Document;

                switch (type) {
                    
                    case 'staff': {
                        const { type, confirm, info, ...data } = input;
                        user = Users.create(data);
                        user.info = info as any;
                        break;
                    }

                    case 'user': {
                        const { type, confirm, ...data } = input;
                        user = Users.create(data);
                        user.role = UserRole.User;
                        user.status = UserStatus.Applied;
                        break;
                    }

                    default: {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR'
                        });
                    }
                }

                await user.save();
                const session = Session.create(user);

                // TODO: apply session

            })

    })

}