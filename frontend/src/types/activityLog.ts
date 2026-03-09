export type ActivityLog = {
  id: number;
  event_type: string;
  entity_type: string | null;
  entity_id: string | number | null;
  severity: string;
  message: string | null;
  details_json: string | null;
  created_at: string;
};

export type ActivityLogFilterParams = {
  event_type?: string;
  entity_type?: string;
  severity?: string;
  limit?: number;
  offset?: number;
};
