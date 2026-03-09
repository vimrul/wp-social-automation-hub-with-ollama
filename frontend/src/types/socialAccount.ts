export type SocialAccount = {
  id: number;
  source_site_id: number;
  platform: string;
  name: string;
  account_identifier: string | null;
  page_id: string | null;
  app_id: string | null;
  client_id: string | null;
  is_active: boolean;
  account_metadata_json: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SocialAccountPayload = {
  source_site_id: number;
  platform: string;
  name: string;
  account_identifier: string;
  page_id: string;
  app_id: string;
  app_secret: string;
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  account_metadata_json: string;
  is_active: boolean;
};
