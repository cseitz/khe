

/** @export 'enum' */


export namespace Enum {
    export function index<Key extends string, Value>(target: Record<Key, Value>, value: Value) {
        return Object.values(target).indexOf(value);
    }
}



// const EnumOperations = {
//     bruh() {

//     }
// }

// export function Enum<Keys extends string, Values>(source: Record<Keys, Values>) {
//     // const ops = Object.create(EnumOperations);
//     // ops.target = target;
//     // return ops as typeof EnumOperations;
//     return {
//         atLeast(target: Values) {

//         }
//     }
// }

// enum Bruh {
//     hi = 'hi',
//     there = 'there',
//     ok = 'ok',
// }

// console.log(Enum.index(Bruh, Bruh.hi) > Enum.index(Bruh, Bruh.there));

// const thing = Enum(Bruh).atLeast(Bruh.hi)