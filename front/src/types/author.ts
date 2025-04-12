/**
 * Author-specific type definitions
 */

export enum AuthorPermission {
  CREATE_POST = 'create_post',
  EDIT_POST = 'edit_post',
  DELETE_POST = 'delete_post',
  SCHEDULE_POST = 'schedule_post',
  MANAGE_COMMENTS = 'manage_comments',
  VIEW_ANALYTICS = 'view_analytics',
}

export interface IAuthor {
  id: string;
  name: string;
  email: string;
  role: 'author';
  permissions: AuthorPermission[];
  avatar?: {
    filename: string;
    altText: string;
  };
}

export interface IAuthorAuthState {
  token: string | null;
  author: IAuthor | null;
  isAuthenticated: boolean;
}
