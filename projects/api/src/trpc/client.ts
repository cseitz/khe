import { createTRPCClient, CreateTRPCClientOptions, createTRPCClientProxy, httpBatchLink, httpLink, loggerLink } from '@trpc/client';
import { setupTRPC } from '@trpc/next';
import { createProxy } from '@trpc/server/shared';
import { get, merge } from 'lodash';
import { NextPageContext } from 'next';
import superjson from 'superjson';
import { Config } from '../../config';
import { Authentication } from '../services/authentication/client';
import type { Router } from './router';

export type Api = Router;

/** @export 'trpc' */

function options(config: {
    ctx?: NextPageContext
}): CreateTRPCClientOptions<Router> {
    const url = Config('api') ? `${Config('api')}/api/trpc` : '/api/trpc';

    return {
        // url,
        transformer: superjson,
        links: [
            loggerLink({
                enabled: () => process.env.NODE_ENV === 'development',
            }),
            httpLink({
                url,
            })
        ],
        headers() {
            return {
                ...Authentication.headers(),
            };
        },
    }
}

const client = createTRPCClient(options({}));
const hooks = setupTRPC<Router>({
    config({ ctx }) {
        return options({ ctx })
    }
})

const proxy = {
    react: hooks.proxy,
    vanilla: createTRPCClientProxy(client),
}


export const trpc = merge(client, hooks);

/** TRPC API
 * - Contains React-Query hooks and vanilla TRPC procedure calls
 */
export const api = createProxy(({ args, path }) => {
    const last = [...path].pop();

    const target = last?.startsWith('use')
        ? proxy.react : proxy.vanilla;

    return get(target, path.join('.'))(...args);
}) as typeof proxy.react & typeof proxy.vanilla;

