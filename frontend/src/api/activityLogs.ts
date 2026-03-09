import api from "./axios";
import type { ActivityLog, ActivityLogFilterParams } from "../types/activityLog";

export async function getActivityLogs(
  params: ActivityLogFilterParams = {}
): Promise<ActivityLog[]> {
  const response = await api.get<ActivityLog[]>("/activity-logs", { params });
  return response.data;
}
