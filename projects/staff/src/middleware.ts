import { NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from 'api/auth/middleware';
import { UserRole } from 'api/data/user';

export const middleware: NextMiddleware = async function (request, event) {
    const url = request.nextUrl.pathname;

    if (url.startsWith('/_next')) {
        return NextResponse.next();
    }

    /** Allow unauthenticated to login */
    if (url.startsWith('/login')) {
        return NextResponse.next();
    }

    /** API handles its own authorization */
    if (url.startsWith('/api')) {
        return NextResponse.next();
    }

    /** Only authenticated users may pass */
    const token = await isAuthenticated(request, event);
    if (token) {
        /** Check if role is at least staff */
        const isStaff = token.role === UserRole.Staff || token.role === UserRole.Admin;
        if (isStaff) {
            return NextResponse.next();
        } else {
            return NextResponse.redirect(new URL('/login?a=1', request.url));
        }
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
}
