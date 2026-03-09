export type SourceSite = {
  id: number;
  name: string;
  base_url: string;
  site_type: string;
  description: string | null;
  default_language: string | null;
  timezone: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SourceSitePayload = {
  name: string;
  base_url: string;
  site_type: string;
  description: string;
  default_language: string;
  timezone: string;
  is_active: boolean;
};
