export type PublishPostPayload = {
  post_id: number;
  social_account_id: number;
  content_text?: string;
  hashtags?: string;
};

export type PublishPostResponse = {
  success: boolean;
  platform: string;
  social_account_id: number;
  post_id: number;
  published_id?: string | null;
  published_url?: string | null;
  message: string;
};
