import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { getDashboardSummary } from "../api/dashboard";

/**
 * Single recent activity item returned by the dashboard API.
 */
type DashboardActivityItem = {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: number | null;
  message: string;
  details: string | null;
  created_at: string;
};

/**
 * Full dashboard summary payload returned by the backend.
 */
type DashboardSummary = {
  total_sites: number;
  total_fetch_configs: number;
  total_posts: number;
  total_prompt_templates: number;
  total_ollama_profiles: number;
  total_social_accounts: number;
  recent_activity: DashboardActivityItem[];
};

/**
 * Safely formats activity details for pretty JSON preview.
 * If the value is valid JSON string, it will be formatted.
 * Otherwise the raw string will be shown as-is.
 */
function formatActivityDetails(details: string | null): string {
  if (!details) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
}

/**
 * Dashboard page
 *
 * Shows:
 * - high-level system counters
 * - recent activity feed
 * - expandable JSON details for each activity item
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const loadDashboardSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
        setError("Failed to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardSummary();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Overview of your automation system."
        />
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Overview of your automation system."
        />
        <EmptyState title="Unable to load dashboard" description={error} />
      </div>
    );
  }

  if (!summary) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Overview of your automation system."
        />
        <EmptyState
          title="No dashboard data"
          description="Dashboard summary is empty."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your automation system."
      />

      <div className="detail-stack">
        {/* Summary statistic cards */}
        <div className="stats-grid">
          <div className="card">
            <div className="muted">Total Source Sites</div>
            <div className="stats-value">{summary.total_sites}</div>
          </div>

          <div className="card">
            <div className="muted">Fetch Configs</div>
            <div className="stats-value">{summary.total_fetch_configs}</div>
          </div>

          <div className="card">
            <div className="muted">Total Posts</div>
            <div className="stats-value">{summary.total_posts}</div>
          </div>

          <div className="card">
            <div className="muted">Prompt Templates</div>
            <div className="stats-value">{summary.total_prompt_templates}</div>
          </div>

          <div className="card">
            <div className="muted">Ollama Profiles</div>
            <div className="stats-value">{summary.total_ollama_profiles}</div>
          </div>

          <div className="card">
            <div className="muted">Social Accounts</div>
            <div className="stats-value">{summary.total_social_accounts}</div>
          </div>
        </div>

        {/* Recent activity section */}
        <div className="card">
          <h3>Recent Activity</h3>

          {summary.recent_activity.length === 0 ? (
            <p className="muted">No recent activity found.</p>
          ) : (
            <div className="generation-list">
              {summary.recent_activity.map((item) => (
                <div
                  key={item.id}
                  className="generation-card activity-card"
                >
                  {/* Main activity content */}
                  <div className="activity-main">
                    <div className="generation-head">
                      <div>
                        <div className="table-strong">{item.event_type}</div>
                        <div className="muted small-text">
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="generation-meta">
                      <span>Entity: {item.entity_type}</span>
                      <span>ID: {item.entity_id ?? "-"}</span>
                    </div>

                    <p className="detail-paragraph">{item.message}</p>
                  </div>

                  {/* Expandable details panel */}
                  {item.details ? (
                    <div className="activity-side">
                      <div className="activity-details-row">
                        <details className="activity-details">
                          <summary className="activity-details-summary">
                            <span className="activity-details-action">
                              <span className="activity-details-label">
                                View details
                              </span>
                              <span className="activity-details-toggle">
                                ▶
                              </span>
                            </span>
                          </summary>

                          <pre className="json-preview activity-json-preview">
                            {formatActivityDetails(item.details)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}