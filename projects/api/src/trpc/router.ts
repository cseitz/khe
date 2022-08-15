import { createNextApiHandler } from '@trpc/server/adapters/next';
import { t } from '.';
import { ticketRouter } from '../models/ticket';
import { userRouter } from '../models/user';
import { Authentication } from '../services/authentication';
import { createContext } from './context';


/** Router type used in client imports */
export type Router = typeof router;

/** Import model routers */
const models = t.router({
    tickets: ticketRouter,
    users: userRouter,
})

/** Import service routers */
const services = t.router({
    auth: Authentication.router,
})

/** Define one-off routes here */
const routes = t.router({
    ping: t.procedure.query(() => {
        console.log('got pinged');
        return new Date();
    }),
})

/** Merge in any routers where other routes are defined */
export const router = t.mergeRouters(
    routes,
    models,
    services
)

export const handleRequest = createNextApiHandler({
    router,
    createContext,
})

