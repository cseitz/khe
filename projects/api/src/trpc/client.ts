import { createTRPCClient, CreateTRPCClientOptions, createTRPCClientProxy, httpBatchLink, httpLink, loggerLink } from '@trpc/client';
import { setupTRPC } from '@trpc/next';
import { createReactQueryHooks } from '@trpc/react';
import { createProxy } from '@trpc/server/shared';
import { get, merge } from 'lodash';
import { NextPageContext } from 'next';
import { useEffect, useMemo } from 'react';
import { QueriesObserver, QueryClient, useQueryClient } from 'react-query';
import superjson from 'superjson';
import { Config } from '../../config';
import type { Router } from './router';

/** @export 'trpc' */

function options(config: {
    ctx?: NextPageContext
}): CreateTRPCClientOptions<Router> {
    const { ctx } = config;
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
                // ...Authentication.headers(),
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

