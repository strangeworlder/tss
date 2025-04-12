export interface IScheduledContent {
  id: string;
  title: string;
  content: string;
  publishAt: Date;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface IContentMetric {
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface IContentChart {
  type: string;
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
}

export interface IContentActivity {
  id: string;
  type: 'post' | 'draft' | 'scheduled';
  title: string;
  date: string;
  status: 'published' | 'draft' | 'scheduled';
}

export interface IActivity {
  id: string;
  date: Date;
  action: string;
  content: string;
  user: string;
}

export interface IContentStatistics {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  activity: IActivity[];
  metrics: IContentMetric[];
  charts: IContentChart[];
  recentActivity: IActivity[];
}
