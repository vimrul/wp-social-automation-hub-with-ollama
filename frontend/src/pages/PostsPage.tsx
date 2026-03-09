import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { getPosts } from "../api/posts";
import { getSourceSites } from "../api/sourceSites";
import type { PostItem } from "../types/post";
import type { SourceSite } from "../types/sourceSite";

function getTone(status: string): "default" | "success" | "warning" | "danger" {
  const normalized = status.toLowerCase();

  if (normalized.includes("published")) return "success";
  if (normalized.includes("failed") || normalized.includes("error")) return "danger";
  if (normalized.includes("pending") || normalized.includes("draft")) return "warning";
  if (normalized.includes("fetched")) return "default";

  return "default";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

export default function PostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sourceSiteId, setSourceSiteId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [postsData, sitesData] = await Promise.all([
        getPosts({
          search: search || undefined,
          status: status || undefined,
          source_site_id: sourceSiteId ? Number(sourceSiteId) : undefined,
          limit: 100,
          offset: 0,
        }),
        getSourceSites(),
      ]);

      setPosts(postsData);
      setSites(sitesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleApplyFilters = async () => {
    await loadData();
  };

  const handleResetFilters = async () => {
    setSearch("");
    setStatus("");
    setSourceSiteId("");

    try {
      setLoading(true);
      setError("");

      const [postsData, sitesData] = await Promise.all([
        getPosts({ limit: 100, offset: 0 }),
        getSourceSites(),
      ]);

      setPosts(postsData);
      setSites(sitesData);
    } catch (err) {
      console.error(err);
      setError("Failed to reset post filters.");
    } finally {
      setLoading(false);
    }
  };

  const siteMap = useMemo(() => {
    return new Map(sites.map((site) => [site.id, site.name]));
  }, [sites]);

  const columns = useMemo(
    () => [
      {
        key: "title",
        title: "Title",
        render: (row: PostItem) => (
          <div>
            <Link to={`/posts/${row.id}`} className="table-link table-strong">
              {row.title}
            </Link>
            <div className="muted small-text">{row.slug}</div>
          </div>
        ),
      },
      {
        key: "source_site",
        title: "Source Site",
        render: (row: PostItem) => siteMap.get(row.source_site_id) || row.source_site_id,
      },
      {
        key: "status",
        title: "Status",
        render: (row: PostItem) => (
          <StatusBadge label={row.status || "unknown"} tone={getTone(row.status || "")} />
        ),
      },
      {
        key: "published_at",
        title: "Published At",
        render: (row: PostItem) => formatDate(row.published_at),
      },
      {
        key: "fetched_at",
        title: "Fetched At",
        render: (row: PostItem) => formatDate(row.fetched_at || row.created_at),
      },
      {
        key: "link",
        title: "Open",
        render: (row: PostItem) => (
          <Link to={`/posts/${row.id}`} className="table-link">
            View Detail
          </Link>
        ),
      },
    ],
    [siteMap]
  );

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Browse fetched posts and manage generation workflow."
      />

      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-field">
            <label>Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug"
            />
          </div>

          <div className="form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="fetched">fetched</option>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="failed">failed</option>
            </select>
          </div>

          <div className="form-field">
            <label>Source Site</label>
            <select value={sourceSiteId} onChange={(e) => setSourceSiteId(e.target.value)}>
              <option value="">All</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
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
        <EmptyState title="Unable to load posts" description={error} />
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description="Try changing filters or fetch posts from a source site."
        />
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <DataTable columns={columns} rows={posts} getRowKey={(row) => row.id} />
      ) : null}
    </div>
  );
}
