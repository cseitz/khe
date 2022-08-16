import { get } from 'lodash';
import type { FieldPath, FieldValue, FieldPathValue } from 'react-hook-form';

type FunctionFieldPath<Values extends object, Paths = FieldPath<Values>> = FieldPath<{
    [K in FieldPath<Values> as FieldPathValue<Values, K> extends Function ? K : never]: FieldPathValue<Values, K>;
}>

type AnalyticData<Controller extends Analytics<any, any>, Operation extends Controller['Paths']> = {
    // @ts-ignore
    data: Awaited<ReturnType<FieldPathValue<Controller['methods'], Operation>>>
    event: `${Controller['prefix']}.${Operation}`
    when: Date
}

export class Analytics<Methods extends object, Prefix extends string> {
    public Paths: FunctionFieldPath<Methods>;

    constructor(public prefix: Prefix, public methods: Methods) {

    }

    // @ts-ignore
    async emit<Path extends FunctionFieldPath<Methods>>(event: Path, ...args: Parameters<FieldPathValue<Methods, Path>>) {
        const data = {
            data: await get(this.methods, event)(...args),
            event: this.prefix + '.' + event,
            when: new Date(),
        }

        console.log('tracked', data);
    }
}

const EmailAnalytics = new Analytics('email', {
    bruh() {

    },
    huh: {
        eey(yooo: string) {
            return { yooo }
        }
    }
})

const hmmm = {} as AnalyticData<typeof EmailAnalytics, 'huh.eey'>;
hmmm.event

EmailAnalytics.emit('huh.eey', 'woah')



// const thingy = {
//     hi() {

//     },
//     ok: {
//         yeah() {
            
//         }
//     }
// }

// type Things = typeof thingy;
// type Bruh = FieldPath<Things>;

// type FunctionsOnly<Values extends object, Paths = FieldPath<Values>> = FieldPath<{
//     [K in FieldPath<Values> as FieldPathValue<Values, K> extends Function ? K : never]: FieldPathValue<Values, K>;
// }>;



// type Hmm = FunctionsOnly<Things>;

// type FunctionThings = {
//     [P in Bruh]: FieldPathValue<Things, P> extends Function ? FieldPathValue<Things, P> : null;
// }

// type RequiredFieldsOnly<T> = {
//     [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
// }

// type Hmm = RequiredFieldsOnly<FunctionThings>;

