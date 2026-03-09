import { Link } from "react-router-dom";
import type { DashboardLatestPost } from "../../types/dashboard";
import EmptyState from "../common/EmptyState";
import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";

type RecentPostsTableProps = {
  posts: DashboardLatestPost[];
};

function getTone(status: string): "default" | "success" | "warning" | "danger" {
  const normalized = status.toLowerCase();

  if (normalized.includes("published")) return "success";
  if (normalized.includes("failed") || normalized.includes("error")) return "danger";
  if (normalized.includes("pending") || normalized.includes("draft")) return "warning";

  return "default";
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

export default function RecentPostsTable({ posts }: RecentPostsTableProps) {
  if (!posts.length) {
    return (
      <EmptyState
        title="No recent posts found"
        description="Once posts are fetched into the system, they will appear here."
      />
    );
  }

  return (
    <DataTable
      columns={[
        {
          key: "title",
          title: "Title",
          render: (row) => (
            <div>
              <Link to={`/posts/${row.id}`} className="table-link">
                {row.title}
              </Link>
              <div className="muted small-text">{row.slug}</div>
            </div>
          ),
        },
        {
          key: "status",
          title: "Status",
          render: (row) => (
            <StatusBadge label={row.status || "unknown"} tone={getTone(row.status || "")} />
          ),
        },
        {
          key: "source_site_id",
          title: "Source Site ID",
          render: (row) => row.source_site_id,
        },
        {
          key: "created_at",
          title: "Created At",
          render: (row) => formatDate(row.created_at),
        },
      ]}
      rows={posts}
      getRowKey={(row) => row.id}
    />
  );
}
