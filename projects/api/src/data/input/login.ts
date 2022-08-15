import { z } from 'zod';
import { userData } from '../models/user';

/** @export 'data/login' */


export type LoginInput = z.infer<typeof loginInput>;
export const loginInput = userData.pick({
    email: true,
    password: true
}).required();

