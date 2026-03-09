export type OllamaProfile = {
  id: number;
  name: string;
  base_url: string;
  model_name: string;
  auth_type: string | null;
  auth_username: string | null;
  custom_headers_json: string | null;
  timeout_seconds: number | null;
  is_default: boolean;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OllamaProfilePayload = {
  name: string;
  base_url: string;
  model_name: string;
  auth_type: string;
  auth_username: string;
  auth_password: string;
  bearer_token: string;
  custom_headers_json: string;
  timeout_seconds: number;
  is_default: boolean;
  is_active: boolean;
  notes: string;
};
