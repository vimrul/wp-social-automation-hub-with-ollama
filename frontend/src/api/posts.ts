import api from "./axios";
import type {
  AIGenerationItem,
  LatestAIGenerationResponse,
  PostDetail,
  PostFilterParams,
  PostItem,
} from "../types/post";

type PostDetailApiResponse = {
  post: PostDetail;
  latest_ai?: {
    twitter_summary?: string | null;
    facebook_summary?: string | null;
    hashtags?: string | null;
  } | null;
};

type PostLatestAiApiResponse = {
  post_id: number;
  latest?: {
    twitter_summary?: string | null;
    facebook_summary?: string | null;
    hashtags?: string | null;
  } | null;
};

export async function getPosts(params: PostFilterParams = {}): Promise<PostItem[]> {
  const response = await api.get<PostItem[]>("/posts", { params });
  return response.data;
}

export async function getPost(postId: number): Promise<PostItem> {
  const response = await api.get<PostItem>(`/posts/${postId}`);
  return response.data;
}

export async function getPostDetail(postId: number): Promise<PostDetailApiResponse> {
  const response = await api.get<PostDetailApiResponse>(`/posts/${postId}/detail`);
  return response.data;
}

export async function getPostAIGenerations(postId: number): Promise<AIGenerationItem[]> {
  const response = await api.get<AIGenerationItem[]>(`/posts/${postId}/ai-generations`);
  return response.data;
}

export async function getPostLatestAI(postId: number): Promise<PostLatestAiApiResponse> {
  const response = await api.get<PostLatestAiApiResponse>(`/posts/${postId}/ai-latest`);
  return response.data;
}

export async function importPostsFromConfig(
  configId: number,
  payload?: { per_page?: number; page?: number }
): Promise<unknown> {
  const response = await api.post(`/posts/import/${configId}`, payload ?? {});
  return response.data;
}

export async function getPostPublishLogs(postId: number): Promise<any[]> {
  const response = await api.get(`/posts/${postId}/publish-logs`);
  return response.data;
}

export type { PostDetailApiResponse, PostLatestAiApiResponse };
