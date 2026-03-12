import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import PromptTemplateModal from "../components/prompt-templates/PromptTemplateModal";
import {
  createPromptTemplate,
  deletePromptTemplate,
  getPromptTemplates,
  updatePromptTemplate,
} from "../api/promptTemplates";
import type {
  PromptTemplate,
  PromptTemplatePayload,
} from "../types/promptTemplate";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<PromptTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPromptTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load prompt templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleCreate = async (payload: PromptTemplatePayload) => {
    try {
      setSaving(true);
      await createPromptTemplate(payload);
      setIsCreateOpen(false);
      await loadTemplates();
    } catch (err) {
      console.error(err);
      alert("Failed to create prompt template.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload: PromptTemplatePayload) => {
    if (!editingTemplate) return;

    try {
      setSaving(true);
      await updatePromptTemplate(editingTemplate.id, payload);
      setEditingTemplate(null);
      await loadTemplates();
    } catch (err) {
      console.error(err);
      alert("Failed to update prompt template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;

    try {
      setSaving(true);
      await deletePromptTemplate(deletingTemplate.id);
      setDeletingTemplate(null);
      await loadTemplates();
    } catch (err) {
      console.error(err);
      alert("Failed to delete prompt template.");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (row: PromptTemplate) => (
          <div>
            <div className="table-strong">{row.name}</div>
            <div className="muted small-text">{row.notes || "-"}</div>
          </div>
        ),
      },
      {
        key: "platform",
        title: "Platform",
        render: (row: PromptTemplate) => row.platform || "-",
      },
      {
        key: "template_type",
        title: "Type",
        render: (row: PromptTemplate) => row.template_type || "-",
      },
      {
        key: "output_format",
        title: "Output",
        render: (row: PromptTemplate) => row.output_format || "-",
      },
      {
        key: "status",
        title: "Status",
        render: (row: PromptTemplate) => (
          <StatusBadge
            label={row.is_active ? "active" : "inactive"}
            tone={row.is_active ? "success" : "warning"}
          />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: PromptTemplate) => (
          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingTemplate(row)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setDeletingTemplate(row)}>
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
        title="Prompt Templates"
        description="Manage reusable prompts for generation workflows."
      />

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          Add Prompt Template
        </button>
      </div>

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load prompt templates" description={error} />
      ) : null}

      {!loading && !error && templates.length === 0 ? (
        <EmptyState
          title="No prompt templates found"
          description="Create your first reusable generation prompt."
        />
      ) : null}

      {!loading && !error && templates.length > 0 ? (
        <DataTable columns={columns} rows={templates} getRowKey={(row) => row.id} />
      ) : null}

      <PromptTemplateModal
        open={isCreateOpen}
        title="Create Prompt Template"
        loading={saving}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <PromptTemplateModal
        open={!!editingTemplate}
        title="Edit Prompt Template"
        initialData={editingTemplate}
        loading={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditingTemplate(null)}
      />

      <ConfirmDialog
        open={!!deletingTemplate}
        title="Delete Prompt Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTemplate(null)}
      />
    </div>
  );
}