import api from "./axios";
import type {
  AIGenerationItem,
  PaginatedPostsResponse,
  PostDetail,
  PostFilterParams,
  PostItem,
} from "../types/post";

/**
 * Response returned by /posts/:id/detail
 */
export type PostDetailApiResponse = {
  post: PostDetail;
  latest_ai?: {
    twitter_summary?: string | null;
    facebook_summary?: string | null;
    hashtags?: string | null;
  } | null;
};

/**
 * Response returned by /posts/:id/ai-latest
 */
export type PostLatestAiApiResponse = {
  post_id: number;
  latest?: {
    twitter_summary?: string | null;
    facebook_summary?: string | null;
    hashtags?: string | null;
  } | null;
};

/**
 * Optional generic type for publish logs until backend shape is finalized.
 */
export type PostPublishLogItem = Record<string, unknown>;

/**
 * Fetch paginated posts list.
 */
export async function getPosts(
  params: PostFilterParams = {}
): Promise<PaginatedPostsResponse> {
  const response = await api.get<PaginatedPostsResponse>("/posts", {
    params,
  });
  return response.data;
}

/**
 * Fetch a single post by ID.
 */
export async function getPost(postId: number): Promise<PostItem> {
  const response = await api.get<PostItem>(`/posts/${postId}`);
  return response.data;
}

/**
 * Fetch detailed post data including latest AI summary if present.
 */
export async function getPostDetail(
  postId: number
): Promise<PostDetailApiResponse> {
  const response = await api.get<PostDetailApiResponse>(
    `/posts/${postId}/detail`
  );
  return response.data;
}

/**
 * Fetch all AI generations for a post.
 */
export async function getPostAIGenerations(
  postId: number
): Promise<AIGenerationItem[]> {
  const response = await api.get<AIGenerationItem[]>(
    `/posts/${postId}/ai-generations`
  );
  return response.data;
}

/**
 * Fetch latest AI output for a post.
 */
export async function getPostLatestAI(
  postId: number
): Promise<PostLatestAiApiResponse> {
  const response = await api.get<PostLatestAiApiResponse>(
    `/posts/${postId}/ai-latest`
  );
  return response.data;
}

/**
 * Trigger post import from a fetch config.
 */
export async function importPostsFromConfig(
  configId: number,
  payload?: { per_page?: number; page?: number }
): Promise<unknown> {
  const response = await api.post(`/posts/import/${configId}`, payload ?? {});
  return response.data;
}

/**
 * Fetch publish logs for a post.
 */
export async function getPostPublishLogs(
  postId: number
): Promise<PostPublishLogItem[]> {
  const response = await api.get<PostPublishLogItem[]>(
    `/posts/${postId}/publish-logs`
  );
  return response.data;
}

/**
 * Bulk delete posts by ID list.
 */
export async function bulkDeletePosts(
  postIds: number[]
): Promise<unknown> {
  const response = await api.delete("/posts/bulk-delete", {
    data: { post_ids: postIds },
  });
  return response.data;
}