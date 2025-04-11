// Type definitions for Express
import type { UserRole } from '../domains/users/models/user.model';

// Define AuthUser type for use in requests
export interface AuthUser {
  id: string;
  email: string;
  role: string | UserRole;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
