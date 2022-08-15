import { hashSync } from 'bcrypt';
import { HydratedDocument, Model, Schema } from 'mongoose';
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
                return result;
            }
        },
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated',
        },
    });

    export const Model = buildModel<Type>('User', schema);

    export const Audit = Auditor({

    })
}


export const Users = new class UserMethods extends Methods<{}, typeof User.Audit> {

    get(filter: string | { id?: string, email?: string }) {
        if (typeof filter === 'string') {
            return User.Model.findById(filter);
        }
        return User.Model.findOne(filter);
    }

    create(data: Partial<UserData>) {
        const user = new User.Model(data);
        return user;
    }

}({ audit: User.Audit });


export const userRouter = t.router({

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

    registerStaff: t.procedure
        .input(staffRegisterInput)
        .mutation(async ({ input, ctx }) => {
            const m = Users.withContext(ctx);

            const { email, password, info } = input;
            const user = m.create({ email, password });
            user.info = {} as any;
            if (user.info) {
                user.info.firstName = info.firstName;
                user.info.lastName = info.lastName;
            }
            await user.save();

            return { user }
        }),

})