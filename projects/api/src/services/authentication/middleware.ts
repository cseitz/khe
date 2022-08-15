import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';
import { AUTH_COOKIE } from './constants';
import { AuthToken } from './token';
import { UserRole } from '../../data/models/user';

/** @export 'auth/middleware' */

/** Next.js Middleware
 * - Checks if the user is authenticated.
 */
export async function isAuthenticated(request: NextRequest, event: NextFetchEvent, verify = true) {
    const sessionKey = request.cookies.get(AUTH_COOKIE);
    if (sessionKey) {

        if (!verify)
            return AuthToken.decode(sessionKey);

        const token = await AuthToken.verify(sessionKey).catch(() => null);
        if (token) {
            return token;
        }

    }
    return false;
}


/** Next.js Middleware
 * - Checks if the user is staff.
 */
export async function isStaff(request: NextRequest, event: NextFetchEvent) {
    const token = await isAuthenticated(request, event);
    if (token) {
        if (token.role === UserRole.Staff || token.role === UserRole.Admin) {
            return true;
        }
    }
    return false;
}

