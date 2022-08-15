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
import { AuthTokenData, AUTH_COOKIE, AUTH_TOKEN_GENERATE_SIZE, AUTH_TOKEN_LENGTH } from './constants';
import { AuthToken } from './token';
import cookie from 'cookie';

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
    export type Instance = LeanDocument<Schema> & typeof extendedSession;
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

    /** Computes additional data appended to key */
    async function computeKey(session: Instance) {
        const { user } = session;
        const key = session.key.slice(0, AUTH_TOKEN_LENGTH);
        return key + await AuthToken.sign({
            role: user.role,
        });
    }


    const extendedSession = {
        eey() {
            return 'hi';
        },
        compute() {
            return computeKey(this)
        }
    }


    /** Retrieves the session */
    export async function get(token: string) {
        token = token.slice(0, AUTH_TOKEN_LENGTH);
        const session = await Model.findOne({ key: token }).lean();
        if (session) {
            session.user = await Users.get({ email: session.email }).lean();
            // @ts-ignore
            session.__proto__ = extendedSession;
            return session as any as Instance;
        }
    }

    /** Updates the session */
    export async function update(session: Instance | string, changes: UpdateQuery<Data> = {}) {
        if (typeof session == 'object') session = session.key.slice(0, AUTH_TOKEN_LENGTH);

        await Model.updateOne({ key: session }, changes).lean();
        return await get(session) as NonNullable<Instance>;
    }

    /** Creates a session from a user */
    export async function create(user: User.Document) {
        const session = new Model({
            email: user.email,
            key: randomBytes(AUTH_TOKEN_GENERATE_SIZE).toString('hex'),
        });
        await session.save();
        const doc = await get(session.key);
        if (!doc) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        return doc;
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
        } else if (req.cookies[AUTH_COOKIE]) {
            return {
                token: req.cookies[AUTH_COOKIE]
            }
        }
        return {}
    }


    export namespace Middleware {

        /** Retrieves a session from TRPC Context */
        export async function getSession(ctx: typeof t['_config']['ctx']) {
            if (ctx.token) {
                const session = await Session.get(ctx.token);
                if (session) {
                    return session;
                }
            }
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
                const token = await session.compute();

                return {
                    token,
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
            // .use(Middleware.isAuthenticated)
            .query(async ({ ctx }) => {
                const session = await Middleware.getSession(ctx);
                if (!session) {
                    return {};
                }
                const { user } = session;
                const token = await session.compute();
                const setCookie = cookie.serialize(AUTH_COOKIE, token, {
                    secure: process.env.NODE_ENV === 'production',
                    path: '/',
                });
                ctx.res.setHeader('Set-Cookie', setCookie)
                return { user, token };
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