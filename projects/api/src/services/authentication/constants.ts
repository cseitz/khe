import type { UserRole } from '../../data/models/user';
import { AuthToken } from './token';

export const AUTH_COOKIE = 'khe_auth_next' as const;
export const AUTH_STORAGE_KEY = 'khe_auth_next' as const;

export const AUTH_TOKEN_GENERATE_SIZE = 48 as const;
export const AUTH_TOKEN_LENGTH = 96 as const; // ^ * 2

export type AuthTokenData = AuthToken.Data;



