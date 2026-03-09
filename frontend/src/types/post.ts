export type PostItem = {
  id: number;
  source_site_id: number;
  fetch_config_id: number | null;
  external_post_id: string | null;
  external_post_url: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  status: string;
  published_at: string | null;
  fetched_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostFilterParams = {
  source_site_id?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type PostDetail = {
  id: number;
  source_site_id: number;
  fetch_config_id: number | null;
  external_post_id: string | null;
  external_post_url: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  raw_content: string | null;
  cleaned_content?: string | null;
  content?: string | null;
  featured_image_url: string | null;
  author_name?: string | null;
  category_names?: string[] | null;
  tag_names?: string[] | null;
  categories?: unknown;
  tags?: unknown;
  status: string;
  published_at: string | null;
  fetched_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AIGenerationItem = {
  id: number;
  post_id: number;
  platform?: string | null;
  generation_type?: string | null;
  prompt_template_id?: number | null;
  ollama_profile_id?: number | null;
  status?: string | null;
  generated_text?: string | null;
  hashtags?: string | null;
  model_name?: string | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LatestAIGenerationResponse = {
  twitter?: AIGenerationItem | null;
  facebook?: AIGenerationItem | null;
  latest?: AIGenerationItem | null;
} | AIGenerationItem | null;
