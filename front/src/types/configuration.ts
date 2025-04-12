export interface IConfiguration {
  id: string;
  postDelay: number;
  commentDelay: number;
  createdAt: string;
  createdBy: string;
}

export interface IContentOverride {
  id: string;
  contentId: string;
  contentType: 'post' | 'comment';
  delayOverride: number;
  createdAt: string;
  createdBy: string;
}

export interface IConfigurationState {
  postDelay: number;
  commentDelay: number;
  contentOverrides: IContentOverride[];
  configurationHistory: IConfiguration[];
  loading: boolean;
  error: string | null;
}
