import { TRPCError } from '@trpc/server'




namespace Error {

    export function Denied(mode: 'authentication' | 'authorization' = 'authorization') {
        if (mode == 'authentication') {
            return new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Not authenticated',
            })
        } else if (mode === 'authorization') {
            return new TRPCError({
                code: 'FORBIDDEN',
                message: 'You lack the required permissions',
            })
        }
    }

    export function NotFound(email: string) {
        return new TRPCError({
            code: 'NOT_FOUND',
            message: `This account does not exist`
        })
    }

    export function IncorrectPassword(email: string) {
        return new TRPCError({
            code: 'FORBIDDEN',
            message: `Incorrect Password`
        })
    }

    export function Verification(error: any) {
        return new TRPCError({
            code: 'FORBIDDEN',
            message: `Verification Failed`,
            cause: error,
        })
    }
}

export const AuthenticationError = Error;