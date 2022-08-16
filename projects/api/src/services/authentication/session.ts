import { TRPCError } from '@trpc/server';
import { randomBytes } from 'crypto';
import { HydratedDocument, LeanDocument, Model, Schema } from 'mongoose';
import { z } from 'zod';
import { UserData } from '../../data/models/user';
import { User, Users } from '../../models/user';
import { buildModel } from '../../models/utils/model';
import { AUTH_TOKEN_GENERATE_SIZE, AUTH_TOKEN_LENGTH } from './constants';


export namespace Session {

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

    const extendedSession = {
        eey() {
            return 'hi';
        },
        toString() {
            // return computeKey(this)
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