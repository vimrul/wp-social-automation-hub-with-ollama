import api from "./axios";

export type DashboardActivityItem = {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: number | null;
  message: string;
  details: string | null;
  created_at: string;
};

export type DashboardSummary = {
  total_sites: number;
  total_fetch_configs: number;
  total_posts: number;
  total_prompt_templates: number;
  total_ollama_profiles: number;
  total_social_accounts: number;
  recent_activity: DashboardActivityItem[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}