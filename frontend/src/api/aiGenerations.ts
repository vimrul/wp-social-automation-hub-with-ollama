import api from "./axios";
import type {
  GenerateContentPayload,
  GenerateContentResponse,
} from "../types/aiGeneration";

export async function generateAIContent(
  payload: GenerateContentPayload
): Promise<GenerateContentResponse> {
  const response = await api.post<GenerateContentResponse>(
    "/ai-generations/generate",
    payload
  );
  return response.data;
}
