import { handleRequest } from '../../../trpc/router';
import { NextApiRequest, NextApiResponse } from 'next';
import { Config } from '../../../../config';
import Cors from 'cors';


const cors = Cors({
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}


export const config = {
    api: {
        externalResolver: true,
    }
}

const dev = Config('mode') === 'development';
export default async function(req: NextApiRequest, res: NextApiResponse) {
    if (dev) await runMiddleware(req, res, cors);
    handleRequest(req, res);
}