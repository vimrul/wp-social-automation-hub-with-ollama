import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import OllamaProfileModal from "../components/ollama-profiles/OllamaProfileModal";
import {
  createOllamaProfile,
  deleteOllamaProfile,
  getOllamaProfiles,
  updateOllamaProfile,
} from "../api/ollamaProfiles";
import type { OllamaProfile, OllamaProfilePayload } from "../types/ollamaProfile";

export default function PublishingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<OllamaProfile[]>([]);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<OllamaProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<OllamaProfile | null>(null);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOllamaProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load Ollama profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const handleCreate = async (payload: OllamaProfilePayload) => {
    try {
      setSaving(true);
      await createOllamaProfile(payload);
      setIsCreateOpen(false);
      await loadProfiles();
    } catch (err) {
      console.error(err);
      alert("Failed to create Ollama profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload: OllamaProfilePayload) => {
    if (!editingProfile) return;

    try {
      setSaving(true);
      await updateOllamaProfile(editingProfile.id, payload);
      setEditingProfile(null);
      await loadProfiles();
    } catch (err) {
      console.error(err);
      alert("Failed to update Ollama profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProfile) return;

    try {
      setSaving(true);
      await deleteOllamaProfile(deletingProfile.id);
      setDeletingProfile(null);
      await loadProfiles();
    } catch (err) {
      console.error(err);
      alert("Failed to delete Ollama profile.");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (row: OllamaProfile) => (
          <div>
            <div className="table-strong">{row.name}</div>
            <div className="muted small-text">{row.notes || "-"}</div>
          </div>
        ),
      },
      {
        key: "base_url",
        title: "Base URL",
        render: (row: OllamaProfile) => row.base_url,
      },
      {
        key: "model_name",
        title: "Model",
        render: (row: OllamaProfile) => row.model_name,
      },
      {
        key: "auth_type",
        title: "Auth",
        render: (row: OllamaProfile) => row.auth_type || "none",
      },
      {
        key: "timeout",
        title: "Timeout",
        render: (row: OllamaProfile) => row.timeout_seconds ?? "-",
      },
      {
        key: "default",
        title: "Default",
        render: (row: OllamaProfile) => (
          <StatusBadge
            label={row.is_default ? "default" : "no"}
            tone={row.is_default ? "success" : "default"}
          />
        ),
      },
      {
        key: "status",
        title: "Status",
        render: (row: OllamaProfile) => (
          <StatusBadge
            label={row.is_active ? "active" : "inactive"}
            tone={row.is_active ? "success" : "warning"}
          />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: OllamaProfile) => (
          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(row)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setDeletingProfile(row)}>
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
        title="Ollama Profiles"
        description="Manage local or remote model connection profiles."
      />

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          Add Ollama Profile
        </button>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load Ollama profiles" description={error} />
      ) : null}

      {!loading && !error && profiles.length === 0 ? (
        <EmptyState
          title="No Ollama profiles found"
          description="Create your first profile to connect a model endpoint."
        />
      ) : null}

      {!loading && !error && profiles.length > 0 ? (
        <DataTable columns={columns} rows={profiles} getRowKey={(row) => row.id} />
      ) : null}

      <OllamaProfileModal
        open={isCreateOpen}
        title="Create Ollama Profile"
        loading={saving}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <OllamaProfileModal
        open={!!editingProfile}
        title="Edit Ollama Profile"
        initialData={editingProfile}
        loading={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditingProfile(null)}
      />

      <ConfirmDialog
        open={!!deletingProfile}
        title="Delete Ollama Profile"
        message={`Are you sure you want to delete "${deletingProfile?.name ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProfile(null)}
      />
    </div>
  );
}
