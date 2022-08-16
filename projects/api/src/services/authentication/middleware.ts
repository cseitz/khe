import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from './constants';
import { UserRole } from '../../data/models/user';
import { AuthToken } from './token';

/** @export 'auth/middleware' */

/** Next.js Middleware
 * - Checks if the user is authenticated.
 */
export function isAuthenticated(request: NextRequest, event: NextFetchEvent, verify = true) {
    const sessionKey = request.cookies.get(AUTH_COOKIE);
    if (sessionKey) {

        if (!verify)
            return AuthToken.decode(sessionKey);

        const token = AuthToken.decode(sessionKey);
        if (token) {
            return token;
        }

    }
    return false;
}


/** Next.js Middleware
 * - Checks if the user is staff.
 */
export function isStaff(request: NextRequest, event: NextFetchEvent) {
    const token = isAuthenticated(request, event);
    if (token) {
        if (token.role === UserRole.Staff || token.role === UserRole.Admin) {
            return true;
        }
    }
    return false;
}

