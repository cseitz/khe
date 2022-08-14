import { TRPCError } from '@trpc/server';
import { Model, Schema } from 'mongoose';
import { z } from 'zod';
import { TicketData, ticketData, TicketStatus } from '../data/models/ticket';
import { Auditor } from '../services/audit/auditor';
import { t } from '../trpc';
import { Methods } from './utils/methods';
import { buildModel } from './utils/model';


/** Ticket Model Definition */
export namespace Ticket {
    export const shape = ticketData;
    export type Data = z.infer<typeof ticketData>;
    export type Schema = Data & typeof SchemaMethods & {

    }

    export type Type = Model<Schema, typeof QueryHelpers>;
    const QueryHelpers = {

    }

    const SchemaMethods = {

    }

    const schema = new Schema<Schema>({

        created: { type: Date },
        updated: { type: Date },

        status: {
            type: String,
            enum: TicketStatus,
            default: TicketStatus.Open,
        },
        assignee: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

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

    export const Model = buildModel<Type>('Ticket', schema);

    export const Audit = Auditor({
        status(from: TicketStatus, to: TicketStatus) {
            return {
                title: 'Changed Status',
                from,
                to,
            }
        }
    })
}



namespace Error {
    export function NotFound(id: string) {
        return new TRPCError({
            code: 'NOT_FOUND',
            message: `Unable to find ticket "${id}"`
        })
    }
}

/** Ticket Controlling Methods */
export const Tickets = new class TicketMethods extends Methods<{}, typeof Ticket.Audit> {

    get(id: string) {
        return Ticket.Model.findById(id);
    }

    list(filter: Partial<Pick<TicketData, 'status'>>, limit = 0, skip = 0) {
        let query = Ticket.Model.find(filter);
        if (limit > 0) {
            query = query.limit(limit);
        }
        if (skip > 0) {
            query = query.skip(skip);
        }
        return query;
    }

    create(data: Partial<TicketData>) {
        const ticket = new Ticket.Model(data);
        return ticket;
    }

    async setStatus(id: string, newStatus: TicketStatus) {
        const ticket = await this.get(id);
        if (!ticket) throw Error.NotFound(id);
        this.audit('status', ticket.status, newStatus);
        ticket.status = newStatus;
        await ticket.save();
    }

}({ audit: Ticket.Audit });



export const ticketRouter = t.router({

    get: t.procedure
        .input(ticketData.pick({ id: true }))
        .query(async ({ input, ctx }) => {
            const m = Tickets.withContext(ctx);
            const { id } = input;

            const ticket = await m.get(id);
            if (!ticket) {
                throw Error.NotFound(id);
            }

            return { ticket }

        }),

    list: t.procedure
        .input(ticketData.pick({ status: true }).partial())
        .query(async ({ input, ctx }) => {
            const m = Tickets.withContext(ctx);

            const tickets = await m.list(input)

            return { tickets }
        }),

    create: t.procedure
        .input(ticketData.pick({ email: true, message: true, name: true, subject: true }))
        .mutation(async ({ input, ctx }) => {
            const m = Tickets.withContext(ctx);

            const ticket = m.create(input);
            await ticket.save();

            return { ticket }
        }),

    status: t.procedure
        .input(ticketData.pick({ id: true, status: true }))
        .mutation(async ({ input, ctx }) => {
            const m = Tickets.withContext(ctx);
            const { id, status } = input;

            const ticket = await m.get(id);
            if (!ticket) {
                throw Error.NotFound(id);
            }

            ticket.status = status;
            await ticket.save();

            return { ticket }

        })

})