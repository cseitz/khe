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
    export async function createContext({ req, res }: CreateNextContextOptions): Promise<{
        token?: string
    }> {
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


    export namespace TRPC {

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

            /** Adds the session to the TRPC Context */
            function createSessionContext<Extra = {}>(session: Session.Instance, extra?: Extra) {
                const ctx = {
                    user: session.email,
                    session,
                }
                return { ...(extra || {}), ...ctx } as Extra & typeof ctx;
            }

            /** Must be logged in */
            export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
                const session = await getSession(ctx);
                if (session) {
                    return next({
                        ctx: createSessionContext(session),
                    })
                }
                throw Error.Denied('authentication');
            })

            /** Must be a user or higher */
            export const isUser = t.middleware(async ({ ctx, next }) => {
                const session = await getSession(ctx);
                if (session && session.user) {
                    const { user } = session;
                    if (user.role === UserRole.User || user.role === UserRole.Staff || user.role === UserRole.Admin) {
                        return next({
                            ctx: createSessionContext(session, {
                                access: 'user',
                            } as const),
                        })
                    }
                }
                throw Error.Denied();
            })

            /** Must be a staff user or higher */
            export const isStaff = t.middleware(async ({ ctx, next }) => {
                const session = await getSession(ctx);
                if (session && session.user) {
                    const { user } = session;
                    if (user.role === UserRole.Staff || user.role === UserRole.Admin) {
                        return next({
                            ctx: createSessionContext(session, {
                                access: 'staff',
                            } as const),
                        })
                    }
                }
                throw Error.Denied();
            })

            /** Must be a admin user */
            export const isAdmin = t.middleware(async ({ ctx, next }) => {
                const session = await getSession(ctx);
                if (session && session.user) {
                    const { user } = session;
                    if (user.role === UserRole.Admin) {
                        return next({
                            ctx: createSessionContext(session, {
                                access: 'admin'
                            } as const),
                        })
                    }
                }
                throw Error.Denied();
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
                
                return {
                    token: await session.toString(),
                }

            })

    })

}


const { fillSession, isAuthenticated, isUser, isStaff, isAdmin } = Authentication.TRPC.Middleware;
export { fillSession, isAuthenticated, isUser, isStaff, isAdmin };