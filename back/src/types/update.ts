import type { IUpdate, UpdateStatus, ContentType } from '../models/UpdateModel';

export interface IUpdateResult {
  success: boolean;
  update?: IUpdate;
  error?: string;
}

export interface IUpdateOptions {
  contentType: ContentType;
  contentId: string;
  status: UpdateStatus;
  details?: Record<string, unknown>;
}
