import { userData, UserInfo } from '../models/user';
import { z } from 'zod';

/** @export 'data/register' */

const PASSWORD = z.string()
    .min(8, 'Must be at least 8 characters')
    .max(20, 'Must be no more than 20 characters');

export type RegisterInput = z.infer<typeof registerInput>;
export const registerInput = userData.pick({
    email: true,
    info: true,
}).extend({
    password: PASSWORD,
    confirm: PASSWORD,
    agree: z.boolean(),
}).required();


export type StaffRegisterInput = z.infer<typeof staffRegisterInput>;
export const staffRegisterInput = registerInput.pick({
    email: true,
    password: true,
    confirm: true,
}).extend({
    info: UserInfo.info.pick({
        firstName: true,
        lastName: true,
    })
})
