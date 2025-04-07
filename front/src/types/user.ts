/**
 * Enum representing user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

/**
 * Interface representing a user in the system
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: {
    filename: string;
    altText: string;
  };
}

export interface IUserAvatar {
  filename: string;
  altText: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export interface User extends IUser {
  createdAt: string;
  updatedAt: string;
}
