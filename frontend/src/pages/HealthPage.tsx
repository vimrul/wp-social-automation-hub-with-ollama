import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import { getHealth } from "../api/dashboard";

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getHealth();
        setStatus(data.status);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to backend health endpoint.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div>
      <PageHeader
        title="Health"
        description="Backend/API connectivity and service health."
      />

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState
          title="Health check failed"
          description={error}
        />
      ) : null}

      {!loading && !error ? (
        <div className="card">
          <div className="health-row">
            <div>
              <h3>API Status</h3>
              <p className="muted">
                This confirms whether the frontend can reach the FastAPI backend.
              </p>
            </div>
            <StatusBadge
              label={status || "unknown"}
              tone={status === "ok" ? "success" : "warning"}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
