import { Auditor, createAuditor } from '../../services/audit/auditor';
import { Context } from '../../trpc/context';


export type MethodContext = {
    [key: string]: any;
} & Partial<Context> & {
    
}

export const DEFAULT_METHOD_CONTEXT: MethodContext = {
    user: 'system'
}

type MethodOptions = {
    audit: ReturnType<typeof Auditor>;
}

export class Methods<Context extends object = {}, Audit = MethodOptions['audit']> {

    audit: Audit;

    // @ts-ignore
    constructor(public options: MethodOptions, public context: MethodContext & Context = DEFAULT_METHOD_CONTEXT) {
        Object.assign(this, options);
        if (options.audit) {
            options.audit = options.audit.withContext(this.context as any);
        }
    }

    withContext(context: MethodContext & Context) {
        // @ts-ignore
        return new this.constructor(this.options, context) as typeof this;
    }
}



const audit = createAuditor({
    ping: (bruh: string) => audit({
        title: 'Ping'
    })
})

const TestM = new class TestMethods extends Methods {

}({ audit });

