import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { Authentication } from '../services/authentication';


/** TRPC Procedure Context
 * - Passed to all procedures.
 * - Instantiated via {@link createContext}
 */
export type Context = inferAsyncReturnType<typeof createContext>;
export async function createContext(options: CreateNextContextOptions) {
    const { req, res } = options;

    return {
        ...await Authentication.createContext(options),
        /** The Express Request associated with this call */
        req,
        /** The Express Response associated with this call */
        res,
    }
}

