import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import SourceFetchConfigModal from "../components/source-fetch-configs/SourceFetchConfigModal";
import { getSourceSites } from "../api/sourceSites";
import {
  createSourceFetchConfig,
  deleteSourceFetchConfig,
  getSourceFetchConfigs,
  testSourceFetchConfig,
  updateSourceFetchConfig,
} from "../api/sourceFetchConfigs";
import type { SourceSite } from "../types/sourceSite";
import type {
  SourceFetchConfig,
  SourceFetchConfigPayload,
} from "../types/sourceFetchConfig";

export default function SourceFetchConfigsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<SourceFetchConfig[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SourceFetchConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<SourceFetchConfig | null>(null);
  const [testResult, setTestResult] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [configsData, sitesData] = await Promise.all([
        getSourceFetchConfigs(),
        getSourceSites(),
      ]);

      setConfigs(configsData);
      setSites(sitesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load source fetch configs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async (payload: SourceFetchConfigPayload) => {
    try {
      setSaving(true);
      await createSourceFetchConfig(payload);
      setIsCreateOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create source fetch config.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload: SourceFetchConfigPayload) => {
    if (!editingConfig) return;

    try {
      setSaving(true);
      await updateSourceFetchConfig(editingConfig.id, payload);
      setEditingConfig(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update source fetch config.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;

    try {
      setSaving(true);
      await deleteSourceFetchConfig(deletingConfig.id);
      setDeletingConfig(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete source fetch config.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (config: SourceFetchConfig) => {
    try {
      const result = await testSourceFetchConfig(config.id);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(err);
      setTestResult("Test failed. Check backend logs or request shape.");
    }
  };

  const siteMap = useMemo(() => {
    return new Map(sites.map((site) => [site.id, site.name]));
  }, [sites]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (row: SourceFetchConfig) => (
          <div>
            <div className="table-strong">{row.fetch_name}</div>
            <div className="muted small-text">
              {row.auth_type || "none"} • {row.http_method || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "source_site",
        title: "Source Site",
        render: (row: SourceFetchConfig) =>
          siteMap.get(row.source_site_id) || row.source_site_id,
      },
      {
        key: "content_path",
        title: "Content Path",
        render: (row: SourceFetchConfig) => row.content_path || "-",
      },
      {
        key: "endpoint",
        title: "Endpoint",
        render: (row: SourceFetchConfig) => (
          <div className="small-text break-all">{row.fetch_url || "-"}</div>
        ),
      },
      {
        key: "status",
        title: "Status",
        render: (row: SourceFetchConfig) => (
          <StatusBadge
            label={row.is_active ? "active" : "inactive"}
            tone={row.is_active ? "success" : "warning"}
          />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: SourceFetchConfig) => (
          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => handleTest(row)}>
              Test
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingConfig(row)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setDeletingConfig(row)}>
              Delete
            </button>
          </div>
        ),
      },
    ],
    [siteMap]
  );

  return (
    <div>
      <PageHeader
        title="Source Fetch Configs"
        description="Manage source API mappings and fetch configuration."
      />

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          Add Fetch Config
        </button>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load fetch configs" description={error} />
      ) : null}

      {!loading && !error && configs.length === 0 ? (
        <EmptyState
          title="No fetch configs found"
          description="Create your first fetch config for a source site."
        />
      ) : null}

      {!loading && !error && configs.length > 0 ? (
        <DataTable columns={columns} rows={configs} getRowKey={(row) => row.id} />
      ) : null}

      {testResult ? (
        <div className="card">
          <h3>Last Test Result</h3>
          <pre className="json-preview">{testResult}</pre>
        </div>
      ) : null}

      <SourceFetchConfigModal
        open={isCreateOpen}
        title="Create Source Fetch Config"
        sourceSites={sites}
        loading={saving}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <SourceFetchConfigModal
        open={!!editingConfig}
        title="Edit Source Fetch Config"
        sourceSites={sites}
        initialData={editingConfig}
        loading={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditingConfig(null)}
      />

      <ConfirmDialog
        open={!!deletingConfig}
        title="Delete Source Fetch Config"
        message={`Are you sure you want to delete "${deletingConfig?.fetch_name ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingConfig(null)}
      />
    </div>
  );
}