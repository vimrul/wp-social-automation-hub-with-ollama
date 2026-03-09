import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import StatCard from "../components/dashboard/StatCard";
import RecentPostsTable from "../components/dashboard/RecentPostsTable";
import { getDashboardSummary } from "../api/dashboard";
import type { DashboardSummaryResponse } from "../types/dashboard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDashboardSummary();
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard summary from backend.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your automation system."
      />

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Dashboard unavailable" description={error} />
      ) : null}

      {!loading && data ? (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total Source Sites"
              value={data.counts.total_sites}
            />
            <StatCard
              label="Total Posts"
              value={data.counts.total_posts}
            />
            <StatCard
              label="Total AI Generations"
              value={data.counts.total_ai_generations}
            />
            <StatCard
              label="Total Activity Logs"
              value={data.counts.total_activity_logs}
            />
            <StatCard
              label="Posts Fetched Today"
              value={data.counts.posts_fetched_today}
            />
            <StatCard
              label="AI Generated Today"
              value={data.counts.ai_generated_today}
            />
            <StatCard
              label="Activity Today"
              value={data.counts.activity_today}
            />
          </div>

          <div className="section-block">
            <div className="section-header">
              <h3>Latest Posts</h3>
              <p className="muted">Most recently fetched posts from the system.</p>
            </div>
            <RecentPostsTable posts={data.latest_posts} />
          </div>
        </>
      ) : null}
    </div>
  );
}
