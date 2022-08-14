import { HydratedDocument, Model, ObjectId, Schema, Document as MongooseDocument } from 'mongoose';
import { buildModel } from '../../models/utils/model';
import { z } from 'zod';
import type { AuditBase } from './auditor';


export namespace AuditLog {
    export const shape = z.object({
        created: z.string().or(z.date().default(new Date())),
        updated: z.string().or(z.date().default(new Date())),
    }).extend({
        user: z.string(),
        title: z.string(),
        type: z.string(),
    });
    export type Data = z.infer<typeof shape>;
    export type Document<B = AuditBase> = HydratedDocument<Schema<B>>;
    export type Schema<B = AuditBase> = Data & B & typeof Methods & {

    }

    export type Type = Model<Schema, typeof QueryHelpers>;
    const QueryHelpers = {

    }

    const Methods = {
        attach(doc: MongooseDocument | string) {

            return this;
        }
    }

    const schema = new Schema<Schema>({

        created: { type: Date },
        updated: { type: Date },

    }, {
        strict: false,
        query: QueryHelpers,
        methods: Methods,
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

    export const Model = buildModel<Type>('Ticket', schema);
}

// const thingy = new AuditLog.Model({

// })

// thingy.attach(thingy);

// const bruh: AuditLog.Document<{
//     omg: string
// }> = {
//     user
// }