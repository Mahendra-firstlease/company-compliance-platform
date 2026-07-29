/**
 * Authentication Session & JWT Types
 */

import { UserRole } from "./user";

export interface AuthSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}

export interface AuthSession {
  user: AuthSessionUser;
  expires: string;
}
