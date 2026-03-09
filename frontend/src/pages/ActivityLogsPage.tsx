import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { getActivityLogs } from "../api/activityLogs";
import type { ActivityLog } from "../types/activityLog";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getSeverityTone(
  severity: string
): "default" | "success" | "warning" | "danger" {
  const normalized = severity.toLowerCase();

  if (normalized === "info") return "default";
  if (normalized === "success") return "success";
  if (normalized === "warning") return "warning";
  if (normalized === "error" || normalized === "critical") return "danger";

  return "default";
}

function compactJson(value?: string | null) {
  if (!value) return "-";

  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

export default function ActivityLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState("");

  const [eventType, setEventType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [severity, setSeverity] = useState("");

  const loadLogs = async (overrides?: {
    event_type?: string;
    entity_type?: string;
    severity?: string;
  }) => {
    try {
      setLoading(true);
      setError("");

      const data = await getActivityLogs({
        event_type: overrides?.event_type ?? (eventType || undefined),
        entity_type: overrides?.entity_type ?? (entityType || undefined),
        severity: overrides?.severity ?? (severity || undefined),
        limit: 100,
        offset: 0,
      });

      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const handleApplyFilters = async () => {
    await loadLogs();
  };

  const handleResetFilters = async () => {
    setEventType("");
    setEntityType("");
    setSeverity("");
    await loadLogs({
      event_type: undefined,
      entity_type: undefined,
      severity: undefined,
    });
  };

  const columns = useMemo(
    () => [
      {
        key: "created_at",
        title: "Created At",
        render: (row: ActivityLog) => formatDate(row.created_at),
      },
      {
        key: "event_type",
        title: "Event Type",
        render: (row: ActivityLog) => (
          <div>
            <div className="table-strong">{row.event_type}</div>
            <div className="muted small-text">{row.message || "-"}</div>
          </div>
        ),
      },
      {
        key: "entity_type",
        title: "Entity",
        render: (row: ActivityLog) => (
          <div>
            <div>{row.entity_type || "-"}</div>
            <div className="muted small-text">{row.entity_id ?? "-"}</div>
          </div>
        ),
      },
      {
        key: "severity",
        title: "Severity",
        render: (row: ActivityLog) => (
          <StatusBadge
            label={row.severity || "unknown"}
            tone={getSeverityTone(row.severity || "")}
          />
        ),
      },
      {
        key: "details_json",
        title: "Details",
        render: (row: ActivityLog) => (
          <details className="table-details">
            <summary>View</summary>
            <pre className="table-json">{compactJson(row.details_json)}</pre>
          </details>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Track system activity and operational events."
      />

      <div className="card filters-card">
        <div className="filters-grid filters-grid-3">
          <div className="form-field">
            <label>Event Type</label>
            <input
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="fetch_completed"
            />
          </div>

          <div className="form-field">
            <label>Entity Type</label>
            <input
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="post"
            />
          </div>

          <div className="form-field">
            <label>Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="">All</option>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
              <option value="critical">critical</option>
            </select>
          </div>
        </div>

        <div className="page-actions page-actions-left">
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load activity logs" description={error} />
      ) : null}

      {!loading && !error && logs.length === 0 ? (
        <EmptyState
          title="No activity logs found"
          description="Logs will appear here when backend events are recorded."
        />
      ) : null}

      {!loading && !error && logs.length > 0 ? (
        <DataTable columns={columns} rows={logs} getRowKey={(row) => row.id} />
      ) : null}
    </div>
  );
}
