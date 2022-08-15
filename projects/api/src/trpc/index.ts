import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { Authentication } from '../services/authentication';
import { Context } from './context';
import { transformer } from './transform';


/** TRPC Procedure Meta
 * Used to define custom route properties
 */
export type Meta = Authentication.Meta & {
    
}

/** TRPC Builder
 * - Used to construct everything TRPC related.
 * - Automatically scoped to Meta, Context, and any other mixins.
 */
export const t = initTRPC<{
    ctx: Context;
    meta: Meta;
}>()({
    transformer,
});

 