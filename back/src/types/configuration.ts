export interface IGlobalDelaySettings {
  postDelayHours: number;
  commentDelayHours: number;
  updatedBy: string;
  updatedAt: Date;
}

export interface IContentOverride {
  contentId: string;
  type?: 'post' | 'comment'; // Made optional since it's not used in all contexts
  delayHours: number;
  reason: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConfigurationError extends Error {
  code: 'CONFIG_NOT_FOUND' | 'INVALID_DELAY';
}

export type ConfigurationKey = 'globalDelay' | 'contentOverride';
