import api from "./axios";
import type {
  PromptTemplate,
  PromptTemplatePayload,
} from "../types/promptTemplate";

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  const response = await api.get<PromptTemplate[]>("/prompt-templates");
  return response.data;
}

export async function createPromptTemplate(
  payload: PromptTemplatePayload
): Promise<PromptTemplate> {
  const response = await api.post<PromptTemplate>("/prompt-templates", payload);
  return response.data;
}

export async function updatePromptTemplate(
  id: number,
  payload: PromptTemplatePayload
): Promise<PromptTemplate> {
  const response = await api.put<PromptTemplate>(`/prompt-templates/${id}`, payload);
  return response.data;
}

export async function deletePromptTemplate(id: number): Promise<void> {
  await api.delete(`/prompt-templates/${id}`);
}
