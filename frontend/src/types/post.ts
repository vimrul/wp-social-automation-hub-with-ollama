/**
 * Lightweight post item used in standard list views.
 */
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

/**
 * Filter params for fetching post lists from API.
 */
export type PostFilterParams = {
  source_site_id?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

/**
 * Full post detail payload used in post detail page / editor / preview.
 */
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

/**
 * AI generation record associated with a post.
 */
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

/**
 * Latest AI generation response.
 * Backend may return:
 * - grouped object (twitter / facebook / latest)
 * - a single generation item
 * - null
 */
export type LatestAIGenerationResponse =
  | {
      twitter?: AIGenerationItem | null;
      facebook?: AIGenerationItem | null;
      latest?: AIGenerationItem | null;
    }
  | AIGenerationItem
  | null;

/**
 * Post list item used in paginated table/list APIs.
 * This is slightly different from PostItem because backend may return
 * normalized/derived field names for list responses.
 */
export type PostListItem = {
  id: number;
  source_site_id: number;
  fetch_config_id?: number | null;
  external_post_id?: string | null;
  external_post_url?: string | null;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  status?: string | null;
  source_publish_status?: string | null;
  original_published_at?: string | null;
  last_fetched_at?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Standard paginated posts API response.
 */
export type PaginatedPostsResponse = {
  items: PostListItem[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * Combined export for convenience when importing everything together.
 */
export type PostTypes = {
  postItem: PostItem;
  postDetail: PostDetail;
  postListItem: PostListItem;
  postFilterParams: PostFilterParams;
  aiGenerationItem: AIGenerationItem;
  latestAiGenerationResponse: LatestAIGenerationResponse;
  paginatedPostsResponse: PaginatedPostsResponse;
};