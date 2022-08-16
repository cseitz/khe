import { get } from 'lodash';
import { FieldPath, FieldPathValue } from 'react-hook-form';
import { z } from 'zod'


type FunctionFieldPath<Values extends object, Paths = FieldPath<Values>> = FieldPath<{
    [K in FieldPath<Values> as FieldPathValue<Values, K> extends Function ? K : never]: FieldPathValue<Values, K>;
}>

export class Analytics<
    Prefix extends string,
    ContextValidator extends z.AnyZodObject,
    Methods extends object,
    Context = z.infer<ContextValidator>,
    Options = {
        event: FunctionFieldPath<Methods>
    } & Context
> {
    public Context: Context;
    constructor(public prefix: Prefix, public contextValidator: ContextValidator, public methods: Methods) {

    }

    // @ts-ignore
    async emit<O extends Options>(options: O, ...args: Parameters<FieldPathValue<Methods, O['event']>>) {
        const { event, ...rest } = options as any;
        const data = {
            data: await get(this.methods, event)(...args),
            event: this.prefix + '.' + event,
            when: new Date(),
            ...rest,
        }

        console.log('tracked', data);
    }

}

const analytics = new Analytics('system', z.object({
    email: z.string().email(),
}), {
    bruh(hey: string) {

    },
    omg: {
        yuh(num: number) {
            return { yuh: 'hehe', num }
        }
    }
})

analytics.emit({ event: 'bruh', email: 'ok' }, 'yea');
analytics.emit({ event: 'omg.yuh', email: 'ye' }, 5);
analytics.emit({ event: 'omg.yuh', email: 'pls' }, 5);

const eey = analytics['methods'];

type cuz = Parameters<((hi: string) => void)>;