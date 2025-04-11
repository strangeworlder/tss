import type { Types } from 'mongoose';

export type ModerationAction = 'approve' | 'reject' | 'flag' | 'unflag' | 'ban' | 'unban';

export interface IModerationRecord {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  contentType: 'post' | 'comment';
  action: ModerationAction;
  moderator: Types.ObjectId;
  reason: string;
  createdAt: Date;
  metadata: {
    previousStatus?: string;
    newStatus?: string;
    abuseScore?: number;
    automatedAction?: boolean;
  };
}
