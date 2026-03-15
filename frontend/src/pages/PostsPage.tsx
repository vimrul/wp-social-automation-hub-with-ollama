import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { bulkDeletePosts, getPosts } from "../api/posts";
import { getSourceSites } from "../api/sourceSites";
import type { SourceSite } from "../types/sourceSite";
import type { PostListItem } from "../types/post";

export default function PostsPage() {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [postsData, sitesData] = await Promise.all([
        getPosts({ limit, offset }),
        getSourceSites(),
      ]);

      setPosts(postsData.items);
      setTotal(postsData.total);
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
  }, [limit, offset]);

  useEffect(() => {
    setSelectedIds([]);
  }, [limit, offset]);

  const siteMap = useMemo(() => {
    return new Map(sites.map((site) => [site.id, site.name]));
  }, [sites]);

  const allSelected = posts.length > 0 && selectedIds.length === posts.length;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + posts.length, total);

  const canGoPrevious = offset > 0;
  const canGoNext = offset + limit < total;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(posts.map((post) => post.id));
  };

  const toggleSelectOne = (postId: number) => {
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      await bulkDeletePosts(selectedIds);
      setSelectedIds([]);

      const remainingOnPage = posts.length - selectedIds.length;
      const newTotal = Math.max(0, total - selectedIds.length);

      if (remainingOnPage <= 0 && offset > 0) {
        setOffset(Math.max(0, offset - limit));
      } else {
        await loadData();
      }

      setTotal(newTotal);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected posts.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "select",
        title: (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
        ),
        render: (row: PostListItem) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelectOne(row.id)}
          />
        ),
      },
      {
        key: "title",
        title: "Title",
        render: (row: PostListItem) => (
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
        render: (row: PostListItem) =>
          siteMap.get(row.source_site_id) || row.source_site_id,
      },
      {
        key: "published_at",
        title: "Published",
        render: (row: PostListItem) =>
          row.original_published_at
            ? new Date(row.original_published_at).toLocaleString()
            : "-",
      },
      {
        key: "status",
        title: "Status",
        render: (row: PostListItem) => (
          <StatusBadge label={row.status || "unknown"} tone="default" />
        ),
      },
    ],
    [allSelected, posts, selectedIds, siteMap]
  );

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Browse imported posts and open detailed view."
      />

      <div className="page-actions posts-toolbar">
        <div className="posts-toolbar-left">
          <div className="muted small-text">
            Showing {startItem}-{endItem} of {total} posts
          </div>

          <div className="posts-page-size">
            <label htmlFor="page-size" className="muted small-text">
              Per page
            </label>
            <select
              id="page-size"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-danger"
          disabled={selectedIds.length === 0}
          onClick={() => setConfirmOpen(true)}
        >
          Delete Selected ({selectedIds.length})
        </button>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load posts" description={error} />
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <EmptyState title="No posts found" description="Import posts to see them here." />
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <>
          <DataTable columns={columns} rows={posts} getRowKey={(row) => row.id} />

          <div className="posts-pagination">
            <button
              className="btn btn-secondary"
              disabled={!canGoPrevious}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </button>

            <div className="posts-pagination-info">
              Page {currentPage} of {totalPages}
            </div>

            <button
              className="btn btn-secondary"
              disabled={!canGoNext}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Selected Posts"
        message={`Are you sure you want to delete ${selectedIds.length} selected post(s)?`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}