export type SocialAccount = {
  id: number;
  name: string;
  platform: string;
  source_site_id: number | null;
  account_identifier: string | null;
  page_id: string | null;
  app_id: string | null;
  client_id: string | null;
  account_metadata_json: string | null;
  is_active: boolean;
  last_validated_at: string | null;
  created_at: string;
  updated_at: string;

  app_secret_configured: boolean;
  client_secret_configured: boolean;
  access_token_configured: boolean;
  refresh_token_configured: boolean;
};

export type SocialAccountPayload = {
  name: string;
  platform: string;
  source_site_id?: number | null;
  account_identifier?: string;
  page_id?: string;
  app_id?: string;
  app_secret?: string;
  client_id?: string;
  client_secret?: string;
  access_token?: string;
  refresh_token?: string;
  account_metadata_json?: string;
  is_active: boolean;
};