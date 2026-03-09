export type DashboardCounts = {
  total_sites: number;
  total_posts: number;
  total_ai_generations: number;
  total_activity_logs: number;
  posts_fetched_today: number;
  ai_generated_today: number;
  activity_today: number;
};

export type DashboardLatestPost = {
  id: number;
  title: string;
  slug: string;
  status: string;
  source_site_id: number;
  created_at: string;
};

export type DashboardSummaryResponse = {
  counts: DashboardCounts;
  latest_posts: DashboardLatestPost[];
};

export type HealthResponse = {
  status: string;
};
