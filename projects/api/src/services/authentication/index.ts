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


    namespace TRPC {

        export async function getSession(ctx: Context) {
            if (ctx.token) {
                const session = await Session.get(ctx.token);
                if (session) {
                    return session;
                }
            }
        }

        export function provideContext<Extra = {}>(session: Session.Instance | undefined, extra?: Extra) {
            const ctx = {
                user: session?.email,
                session,
            }
            return { ...(extra || {}), ...ctx } as Extra & typeof ctx;
        }


        export namespace Middleware {

            export const fillSession = t.middleware(async ({ ctx, next }) => {
                const session = await getSession(ctx);
                return next({
                    ctx: provideContext(session)
                })
            })

        }
    }


    export const router = t.router({

        login: t.procedure
            .input(z.object({
                email: z.string().email(),
                password: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const { email, password } = input;

                const user = await Users.get({ email }).lean();

                if (!user || !user?.password) {
                    throw Error.NotFound(email);
                }
                if (!await compare(password, user.password)) {
                    throw Error.IncorrectPassword(email);
                }

                const session = await Session.create(user);
                const token = session.toString();

                return {
                    user,
                    token,
                }

            }),

        logout: t.procedure
            .use(TRPC.Middleware.fillSession)
            .mutation(async ({ ctx }) => {
                if (ctx.session) {
                    const { session } = ctx;
                    Session.invalidate(session);
                    return true;
                }
                return false;
            }),


        /** Retrieves your own user */
        me: t.procedure
            .use(TRPC.Middleware.fillSession)
            .query(async ({ ctx }) => {
                if (ctx.session) {
                    const { session } = ctx;
                    const { password, ...user } = session.user;
                    return {
                        token: session.toString(),
                        user,
                    }
                }
                return false;
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