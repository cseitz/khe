import { hashSync } from 'bcrypt';
import { FilterQuery, HydratedDocument, Model, Schema } from 'mongoose';
import { z } from 'zod';
import { staffRegisterInput } from '../data/input/register';
import { UserData, userData, UserRole, UserStatus } from '../data/models/user';
import { Auditor } from '../services/audit/auditor';
import { t } from '../trpc';
import { Methods } from './utils/methods';
import { buildModel } from './utils/model';


export namespace User {
    export const shape = userData;
    export type Data = UserData;
    export type Document = HydratedDocument<Schema>;
    export type Schema = Data & typeof SchemaMethods & {

    }

    export type Type = Model<Schema, typeof QueryHelpers>;
    const QueryHelpers = {

    }

    const SchemaMethods = {

    }

    const schema = new Schema<Schema>({

        email: { type: String, unique: true, required: true },
        password: { type: String, required: true, set: p => hashSync(p, 10) },
        role: {
            type: String,
            enum: UserRole,
            default: UserRole.Pending,
        },
        status: {
            type: String,
            enum: UserStatus,
            default: UserStatus.Pending,
        },
        created: { type: Date },
        updated: { type: Date },

    }, {
        strict: false,
        query: QueryHelpers,
        methods: SchemaMethods,
        toObject: {
            virtuals: true,
            transform(doc, result) {
                delete result._id;
                delete result.__v;
                delete result.password;
                return result;
            }
        },
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated',
        },
    });

    schema.index({
        'email': 'text',
        'info.firstName': 'text',
        'info.lastName': 'text',
    })

    export const Model = buildModel<Type>('User', schema);

    export const Audit = Auditor({

    })
}


const PARSE_REGEXP = /(?:[^\s("'[\()]+|("|'|\[|\()[^("'[\()]*("|'|\]|\)))+/g;
function parseSearch(search: string) {
    const tokens = Array.from(search.matchAll(PARSE_REGEXP)).map(o => o[0]);
    let $search: string[] = [];
    const filter: FilterQuery<User.Data> = {}
    for (const token of tokens) {
        if (token.includes(':')) {
            const [pre, post] = token.split(':');
            if (pre === 'role' || pre == 'status') {
                filter[pre] = post;
            }
        } else {
            $search.push(token);
        }
    }
    if ($search.length > 0) {
        filter.$text = {
            $search: $search.join(' '),
        }
    }
    return filter;
}

export const Users = new class UserMethods extends Methods<{}, typeof User.Audit> {

    get(filter: string | { id?: string, email?: string }) {
        if (typeof filter === 'string') {
            return User.Model.findById(filter);
        }
        return User.Model.findOne(filter);
    }

    list(filter: FilterQuery<UserData> | { search?: string } = {}, limit = 0, skip = 0) {
        if ('search' in filter) {
            filter = parseSearch(filter.search);
        }
        let query = User.Model.find(filter);
        if (limit > 0) {
            query = query.limit(limit);
        }
        if (skip > 0) {
            query = query.skip(skip);
        }
        return query;
    }

    create(data: Partial<UserData>) {
        const user = new User.Model(data);
        return user;
    }

}({ audit: User.Audit });


export const userRouter = t.router({

    // TODO: do get

    get: t.procedure
        .input(userData.pick({ email: true }))
        .query(async ({ input, ctx }) => {
            const m = Users.withContext(ctx);
            const { email } = input;

            const user = await m.get(email).lean() //as User.Data;
            if (!user) {
                // throw Error.NotFound(id);
            }

            return { user }

        }),

    list: t.procedure
        .input(z.object({ search: z.string().optional() }))
        .query(async ({ input, ctx }) => {
            const m = Users.withContext(ctx);

            const users = await m.list(input).lean() //as User.Data[]

            return { users }
        }),

    // create: t.procedure
    //     .input(staffRegisterInput)
    //     .mutation(async ({ input, ctx }) => {
    //         const m = Users.withContext(ctx);

    //         const { email, password, info } = input;
    //         const user = m.create({ email, password });
    //         user.info = {} as any;
    //         if (user.info) {
    //             user.info.firstName = info.firstName;
    //             user.info.lastName = info.lastName;
    //         }
    //         await user.save();

    //         return { user }
    //     }),

    // registerStaff: t.procedure
    //     .input(staffRegisterInput)
    //     .mutation(async ({ input, ctx }) => {
    //         const m = Users.withContext(ctx);

    //         const { email, password, info } = input;
    //         const user = m.create({ email, password });
    //         user.info = {} as any;
    //         if (user.info) {
    //             user.info.firstName = info.firstName;
    //             user.info.lastName = info.lastName;
    //         }
    //         await user.save();

    //         return { user }
    //     }),

})