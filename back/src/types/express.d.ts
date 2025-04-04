import { IUser } from '../domains/users/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        avatar?: {
          filename: string;
          altText: string;
        };
      };
    }
  }
}

export {}; 