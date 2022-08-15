import { inferAsyncReturnType, TRPCError } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { compare } from 'bcrypt';
import { randomBytes } from 'crypto';
import { HydratedDocument, LeanDocument, Model, Schema, UpdateQuery } from 'mongoose';
import { NextApiRequest } from 'next';
import { z } from 'zod';
import { UserData, UserRole } from '../../data/models/user';
import { User, Users } from '../../models/user';
import { buildModel } from '../../models/utils/model';
import { t } from '../../trpc/index';


namespace Error {

    export function Denied(mode: 'authentication' | 'authorization' = 'authorization') {
        if (mode == 'authentication') {
            return new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Not authenticated',
            })
        } else if (mode === 'authorization') {
            return new TRPCError({
                code: 'FORBIDDEN',
                message: 'You lack the required permissions',
            })
        }
    }

    export function NotFound(email: string) {
        return new TRPCError({
            code: 'NOT_FOUND',
            message: `This account does not exist`
        })
    }

    export function IncorrectPassword(email: string) {
        return new TRPCError({
            code: 'FORBIDDEN',
            message: `Incorrect Password`
        })
    }

    export function Verification(error: any) {
        return new TRPCError({
            code: 'FORBIDDEN',
            message: `Verification Failed`,
            cause: error,
        })
    }
}


namespace Session {

    export const shape = z.object({
        key: z.string(),
        email: z.string().email(),

        created: z.string().or(z.date().default(new Date())),
        updated: z.string().or(z.date().default(new Date())),
    })

    export type Data = z.infer<typeof shape>;
    export type Document = HydratedDocument<Schema>;
    export type Instance = LeanDocument<Schema>;
    export type Schema = Data & {
        user: LeanDocument<UserData>;
    };
    export type Type = Model<Schema, {}>;

    const schema = new Schema<Schema>({
        created: { type: Date },
        updated: { type: Date },
        email: { type: String, required: true, },
        key: {
            type: String,
            required: true,
        }
    }, {
        strict: false,
        toObject: {
            virtuals: true,
            transform(doc, result) {
                delete result._id;
                delete result.__v;
                return result;
            }
        },
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated',
        },
    })

    const Model = buildModel<Type>('Session', schema);


    /** Retrieves the session */
    export async function get(token: string) {
        const session = await Model.findOne({ key: token }).lean();
        if (session) {
            session.user = await Users.get({ email: session.email }).lean();
            return session;
        }
        // if (!session) {
        //     throw Error.Verification('Session is not in database');
        // }
        // return session;
    }

    /** Updates the session */
    export async function update(session: Instance | string, changes: UpdateQuery<Data>) {
        if (typeof session == 'object') session = session.key;
        return await Model.updateOne({ key: session }, changes).lean();
    }

    /** Creates a session from a user */
    export async function create(user: User.Document) {
        const session = new Model({
            email: user.email,
            key: randomBytes(48).toString('hex'),
        });
        await session.save();
        return session;
    }

    /** Invalidates a session */
    export async function invalidate(session: Instance | string) {
        if (typeof session == 'object') session = session.key;
        await Model.deleteOne({ key: session });
    }

}

export namespace Authentication {

    export type Meta = {

    }

    export type Context = inferAsyncReturnType<typeof createContext>;
    export async function createContext({ req, res }: CreateNextContextOptions) {
        if (req.headers.authorization) {
            return {
                token: req.headers['authorization']
            }
        } else if (req.cookies['authorization']) {
            return {
                token: req.headers['authorization']
            }
        }
        return {}
    }


    export namespace Middleware {

        /** Retrieves a session from TRPC Context */
        async function getSession(ctx: typeof t['_config']['ctx']) {
            if (ctx.token) {
                const session = await Session.get(ctx.token);
                if (session) {
                    return session;
                    // return [
                    //     session,
                    //     await Users.get(session.email).lean()
                    // ] as [Session.Instance, LeanDocument<User.Data>]
                }
            }
            // return [null, null]
        }

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


    export const router = t.router({

        /** Creates a session */
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

                const session = await Session.create(user);

                return {
                    token: session.key,
                };

            }),

        /** Invalidates the current session */
        logout: t.procedure
            .use(Middleware.isAuthenticated)
            .mutation(async ({ ctx }) => {
                const { session } = ctx;
                await Session.invalidate(session);
                return 'ok';
            }),

        /** Retrieves your own user */
        me: t.procedure
            .use(Middleware.isAuthenticated)
            .query(async ({ ctx }) => {
                const { session } = ctx;
                const { user } = session;
                return user;
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
            })

    })
}


const { isAuthenticated, isUser, isStaff, isAdmin } = Authentication.Middleware;
export { isAuthenticated, isUser, isStaff, isAdmin }