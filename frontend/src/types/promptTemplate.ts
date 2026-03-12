export type PromptTemplate = {
  id: number;
  name: string;
  platform: string | null;
  template_type: string | null;
  system_prompt: string | null;
  user_prompt_template: string | null;
  output_format: string | null;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PromptTemplatePayload = {
  name: string;
  platform: string;
  template_type: string;
  system_prompt: string;
  user_prompt_template: string;
  output_format: string;
  is_active: boolean;
  notes: string;
};
