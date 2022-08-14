import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';


/** TRPC Procedure Context
 * - Passed to all procedures.
 * - Instantiated via {@link createContext}
 */
export type Context = inferAsyncReturnType<typeof createContext>;
export async function createContext(options: CreateNextContextOptions) {
    const { req, res } = options;

    return {
        user: 'hi',
        // ...await Authentication.createContext(options),
        /** The Express Request associated with this call */
        req,
        /** The Express Response associated with this call */
        res,
    }
}

