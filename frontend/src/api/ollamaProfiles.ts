import api from "./axios";
import type { OllamaProfile, OllamaProfilePayload } from "../types/ollamaProfile";

export async function getOllamaProfiles(): Promise<OllamaProfile[]> {
  const response = await api.get<OllamaProfile[]>("/ollama-profiles");
  return response.data;
}

export async function createOllamaProfile(
  payload: OllamaProfilePayload
): Promise<OllamaProfile> {
  const response = await api.post<OllamaProfile>("/ollama-profiles", payload);
  return response.data;
}

export async function updateOllamaProfile(
  id: number,
  payload: OllamaProfilePayload
): Promise<OllamaProfile> {
  const response = await api.put<OllamaProfile>(`/ollama-profiles/${id}`, payload);
  return response.data;
}

export async function deleteOllamaProfile(id: number): Promise<void> {
  await api.delete(`/ollama-profiles/${id}`);
}
