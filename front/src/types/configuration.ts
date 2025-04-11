export interface IConfiguration {
  id: string;
  globalDelay: number;
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
  globalDelay: number;
  contentOverrides: IContentOverride[];
  configurationHistory: IConfiguration[];
  loading: boolean;
  error: string | null;
}
