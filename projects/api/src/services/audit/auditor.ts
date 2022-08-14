// import { KnownKeys } from 'ts-toolbelt/out/Any/KnownKeys';
import { Context } from '../../trpc/context'
import { AuditLog } from './log';


interface AuditContext extends Partial<Context> {
    user: string
}

/** Type of an action */
type AuditAction = (this: AuditContext, ...args: any[]) => { [key: string]: any } & Parameters<typeof wrapAuditAction>[1];

/** Populates data from context and action return values */
function wrapAuditAction<
    Props extends { title: string } & { [key: string]: any }
>(context: AuditContext, props: Props) {
    const { title, ...rest } = props;
    const { user } = context;
    return {
        ...rest,
        title,
        user,
    }
}

export type KnownKeys<T> = keyof {
    [K in keyof T as string extends K ? never : number extends K ? never : K]: never
}

export type AuditBase = Pick<ReturnType<typeof wrapAuditAction>, KnownKeys<ReturnType<typeof wrapAuditAction>>>;


/** Builds an audit function bound to the provided context, with the given actions.
 * Actions Example: `{ ping(param: string) => ({ title: 'got pinged', param }), }`
 */
export function Auditor<
    // Events extends Record<string, Function>
    Events extends Record<string, AuditAction>
>(events: Events, context: AuditContext = { user: '?' }) {

    // @ts-ignore
    /** Runs an action and returns the log */
    function audit<Key extends keyof Events>(type: Key, ...args: Parameters<Events[Key]>) {
        const func = events[type];
        const result = func.call(context, ...args) as ReturnType<Events[Key]>;
        const data = wrapAuditAction(context, result);
        return data;
    }

    function withContext(ctx: AuditContext) {
        return Auditor(events, ctx)
    }

    // function cast<Doc extends AuditLog.Document>(doc: Doc): AuditLog.Document<ReturnType<Events[Doc['type']]>> {
    //     return doc as any;
    // }

    function type<
        Key extends keyof Events,
        Doc extends AuditLog.Document
        // @ts-ignore
    >(type: Key, doc: Doc): doc is AuditLog.Document<ReturnType<Events[Key]>> {
        if (doc.type === type) {
            return true;
        }
        return false;
    }

    return Object.assign(audit, {
        withContext,
        type,
    });
}

export function createAuditor<Events extends Record<string, AuditAction>>(events: Events) {
    return Auditor(events);
}

const audit = Auditor({
    ping({ bruh }: { bruh: string }) {
        return {
            title: 'hi',
            bruh,
        }
    },
    eeey(hi: string, ok: number) {
        return {
            title: 'eeey',
            hi,
            ok,
        }
    },
})

// audit.withContext({ user: 'hi' })('eeey')

// audit('ping', { bruh: 'eey' })
// audit('eeey', 'hi', 5);


// const bruh = { type: 'eeey' } as any as AuditLog.Document;
// if (audit.type('eeey', bruh)) {
//     bruh
// }
// // if (bruh.type === 'ping') {
// //     const thingy = audit.cast(bruh);
// // }


