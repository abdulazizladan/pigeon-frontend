export type UserRole = 'admin' | 'director' | 'manager';

export interface UserSession {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
  /** Where to send the user after a successful login (set by the auth guard). */
  returnUrl?: string | null;
}

export interface LoginResponse {
  access_token: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}
