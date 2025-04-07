export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export interface IUserAvatar {
  filename: string
  altText: string
}

export interface IUser {
  id: string
  _id?: string // MongoDB _id field
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar?: IUserAvatar
  bio?: string
}

export interface IAuthResponse {
  user: IUser
  token: string
}

export interface User extends IUser {
  createdAt: string
  updatedAt: string
}
