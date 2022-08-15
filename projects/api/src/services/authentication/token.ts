import { AUTH_TOKEN_LENGTH } from './constants'
import { SignJWT, jwtVerify, decodeJwt } from 'jose';

export namespace AuthToken {
    const secret = process.env.AUTH_SECRET;
    export type Data = {
        role: string
    }


    export function sign(data: Data) {
        const iat = Math.floor(Date.now() / 1000);
        return new SignJWT(data)
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt(iat)
            .sign(new TextEncoder().encode(secret));
    }

    export async function verify(sessionKey: string) {
        const token = sessionKey.slice(AUTH_TOKEN_LENGTH);
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        return payload as Data;
    }

    export function decode(sessionKey: string) {
        const token = sessionKey.slice(AUTH_TOKEN_LENGTH);
        const payload = decodeJwt(token) as Data;
        return payload;
    }
}