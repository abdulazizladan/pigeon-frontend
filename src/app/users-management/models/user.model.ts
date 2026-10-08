import { UserRole } from '../../auth/models/auth.model';

export type { UserRole };

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserPayload {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
}

/** "First Last", falling back to the username for legacy rows without names. */
export function fullName(user: Pick<User, 'firstName' | 'lastName' | 'username'>): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.username;
}

/** Matches the backend PHONE_NUMBER_PATTERN in create-user.dto.ts. */
export const PHONE_NUMBER_PATTERN = /^\+?[0-9][0-9\s().-]{5,18}[0-9]$/;
