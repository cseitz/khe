import { ticketData } from '../models/ticket';
import { z } from 'zod';

/** @export 'data/contact' */

export type ContactInput = z.infer<typeof contactInput>;

/** Input schema for submitting a ticket */
export const contactInput = ticketData.pick({
    email: true,
    name: true,
    subject: true,
    message: true,
})