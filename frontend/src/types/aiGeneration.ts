export type GenerateContentPayload = {
  post_id: number;
  ollama_profile_id: number;
  prompt_template_id: number;
};

export type GenerateContentResponse = {
  success: boolean;
  generation_id: number;
  generation_type: string;
  output_text: string;
  message: string;
};
