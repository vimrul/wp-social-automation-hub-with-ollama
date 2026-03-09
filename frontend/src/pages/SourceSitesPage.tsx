import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import SourceSiteModal from "../components/source-sites/SourceSiteModal";
import {
  createSourceSite,
  deleteSourceSite,
  getSourceSites,
  updateSourceSite,
} from "../api/sourceSites";
import type { SourceSite, SourceSitePayload } from "../types/sourceSite";

export default function SourceSitesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SourceSite | null>(null);
  const [deletingSite, setDeletingSite] = useState<SourceSite | null>(null);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSourceSites();
      setSites(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load source sites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSites();
  }, []);

  const handleCreate = async (payload: SourceSitePayload) => {
    try {
      setSaving(true);
      await createSourceSite(payload);
      setIsCreateOpen(false);
      await loadSites();
    } catch (err) {
      console.error(err);
      alert("Failed to create source site.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload: SourceSitePayload) => {
    if (!editingSite) return;

    try {
      setSaving(true);
      await updateSourceSite(editingSite.id, payload);
      setEditingSite(null);
      await loadSites();
    } catch (err) {
      console.error(err);
      alert("Failed to update source site.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSite) return;

    try {
      setSaving(true);
      await deleteSourceSite(deletingSite.id);
      setDeletingSite(null);
      await loadSites();
    } catch (err) {
      console.error(err);
      alert("Failed to delete source site.");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (row: SourceSite) => (
          <div>
            <div className="table-strong">{row.name}</div>
            <div className="muted small-text">{row.description || "-"}</div>
          </div>
        ),
      },
      {
        key: "base_url",
        title: "Base URL",
        render: (row: SourceSite) => (
          <a href={row.base_url} target="_blank" rel="noreferrer" className="table-link">
            {row.base_url}
          </a>
        ),
      },
      {
        key: "site_type",
        title: "Type",
        render: (row: SourceSite) => row.site_type,
      },
      {
        key: "language",
        title: "Language",
        render: (row: SourceSite) => row.default_language || "-",
      },
      {
        key: "timezone",
        title: "Timezone",
        render: (row: SourceSite) => row.timezone || "-",
      },
      {
        key: "status",
        title: "Status",
        render: (row: SourceSite) => (
          <StatusBadge
            label={row.is_active ? "active" : "inactive"}
            tone={row.is_active ? "success" : "warning"}
          />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: SourceSite) => (
          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingSite(row)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setDeletingSite(row)}>
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Source Sites"
        description="Manage WordPress and content source configurations."
      />

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          Add Source Site
        </button>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load source sites" description={error} />
      ) : null}

      {!loading && !error && sites.length === 0 ? (
        <EmptyState
          title="No source sites found"
          description="Create your first source site to start fetching content."
        />
      ) : null}

      {!loading && !error && sites.length > 0 ? (
        <DataTable columns={columns} rows={sites} getRowKey={(row) => row.id} />
      ) : null}

      <SourceSiteModal
        open={isCreateOpen}
        title="Create Source Site"
        loading={saving}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <SourceSiteModal
        open={!!editingSite}
        title="Edit Source Site"
        initialData={editingSite}
        loading={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditingSite(null)}
      />

      <ConfirmDialog
        open={!!deletingSite}
        title="Delete Source Site"
        message={`Are you sure you want to delete "${deletingSite?.name ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSite(null)}
      />
    </div>
  );
}
