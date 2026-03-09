import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://127.0.0.1:8000/api/v1/health");
        const text = await response.text();

        setResult(`HTTP ${response.status}\n\n${text}`);
      } catch (err) {
        console.error("Health fetch error:", err);
        setError(err instanceof Error ? err.message : String(err));
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
        <div className="card">
          <h3>Health check failed</h3>
          <p className="muted">{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="card">
          <h3>Raw Health Response</h3>
          <pre className="json-preview">{result}</pre>
        </div>
      ) : null}
    </div>
  );
}
