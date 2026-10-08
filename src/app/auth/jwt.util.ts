import { JwtPayload, UserSession } from './models/auth.model';

/** Decodes a JWT payload without verifying it. Verification is the backend's job. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload, nowMs = Date.now()): boolean {
  return typeof payload.exp !== 'number' || payload.exp * 1000 <= nowMs;
}

export function sessionFromJwt(payload: JwtPayload): UserSession {
  return { id: payload.sub, username: payload.username, role: payload.role };
}
