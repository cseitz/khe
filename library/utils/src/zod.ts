import { BrowserNativeObject, FieldPath, FieldPathValue, FieldValues, PathValue, Primitive } from 'react-hook-form';
import { z, ZodObject } from 'zod';


/** @export 'zod' */

export declare type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;
export declare type ArrayKey = number;
export declare type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

declare type ZodPathImpl<K extends string | number, V> = V extends Primitive | BrowserNativeObject ? `${K}` : never | `${K}.${ZodPath<V>}`;


export declare type ZodPath<T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: ZodPathImpl<K & string, T[K]>;
}[TupleKeys<T>] : ZodPathImpl<ArrayKey, V> : {
    [K in keyof T]-?: ZodPathImpl<K & string, T[K]>;
}[keyof T];

export declare type ZodFieldPathValue<TFieldValues extends FieldValues, TFieldPath extends FieldPath<TFieldValues>> = PathValue<TFieldValues, TFieldPath>;


type ZodPathValue<T extends FieldValues, P extends string> = (
    P extends `${infer K}.${infer R}` ? (
        // @ts-ignore
        ZodPathValue<FieldPathValue<T, K>['shape'], R>
        // @ts-ignore
    ) : FieldPathValue<T, P>
)

// @ts-ignore
type ZodObjectValues<T, I = z.infer<T>> = {
    // @ts-ignore
    [P in ZodPath<I>]: ZodPathValue<T['shape'], P>
}


export namespace ZodUtils {

    namespace Internal {
        export function toPaths<Z extends z.AnyZodObject>(obj: Z, path: string[] = []): any {
            let refined = z.object({});
            for (const key in obj.shape) {
                const value = obj.shape[key];
                if (value instanceof ZodObject) {
                    refined = refined.merge(toPaths(value, [...path, key]));
                } else {
                    refined = refined.extend({
                        [[...path, key].join('.')]: value
                    })
                }
            }
            return refined;
        }
    }

    export function toPaths<O extends z.AnyZodObject>(obj: O) {
        return z.object<ZodObjectValues<O>>(Internal.toPaths(obj).shape);
    }
}



type A = z.infer<typeof A>;
const A = z.object({
    hi: z.string(),
    there: z.object({
        bruh: z.string(),
        ok: z.number(),
        eeey: z.object({
            pls: z.string()
        })
    })
});


type B = z.infer<typeof B>;
const B = ZodUtils.toPaths(A);

console.log(B.shape);
