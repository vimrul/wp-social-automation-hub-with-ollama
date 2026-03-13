import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SocialAccountModal from "../components/social-accounts/SocialAccountModal";
import { getSourceSites } from "../api/sourceSites";
import {
  createSocialAccount,
  deleteSocialAccount,
  getSocialAccounts,
  updateSocialAccount,
  validateSocialAccount,
} from "../api/socialAccounts";
import type { SocialAccount, SocialAccountPayload } from "../types/socialAccount";
import type { SourceSite } from "../types/sourceSite";

export default function SocialAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SocialAccount | null>(null);

  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [accountsData, sitesData] = await Promise.all([
        getSocialAccounts(),
        getSourceSites(),
      ]);

      setAccounts(accountsData);
      setSites(sitesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load social accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async (payload: SocialAccountPayload) => {
    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      await createSocialAccount(payload);
      setIsCreateOpen(false);
      setActionMessage("Social account created successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setActionError("Failed to create social account.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload: SocialAccountPayload) => {
    if (!editingAccount) return;

    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      await updateSocialAccount(editingAccount.id, payload);
      setEditingAccount(null);
      setActionMessage("Social account updated successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setActionError("Failed to update social account.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      const result = await deleteSocialAccount(deletingAccount.id);
      setDeletingAccount(null);
      setActionMessage(result.message || "Social account deleted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setActionError("Failed to delete social account.");
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (account: SocialAccount) => {
    try {
      setValidatingId(account.id);
      setActionMessage("");
      setActionError("");

      const result = await validateSocialAccount(account.id);
      setActionMessage(result.message || "Social account validated successfully.");
      await loadData();
    } catch (err: any) {
      console.error(err);
      setActionError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to validate social account."
      );
    } finally {
      setValidatingId(null);
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
        render: (row: SocialAccount) => (
          <div>
            <div className="table-strong">{row.name}</div>
            <div className="muted small-text">{row.account_identifier || "-"}</div>
          </div>
        ),
      },
      {
        key: "platform",
        title: "Platform",
        render: (row: SocialAccount) => row.platform,
      },
      {
        key: "source_site",
        title: "Source Site",
        render: (row: SocialAccount) =>
          row.source_site_id
            ? siteMap.get(row.source_site_id) || row.source_site_id
            : "-",
      },
      {
        key: "page_id",
        title: "Page ID",
        render: (row: SocialAccount) => row.page_id || "-",
      },
      {
        key: "tokens",
        title: "Configured",
        render: (row: SocialAccount) => (
          <div className="small-text">
            <div>Access: {row.access_token_configured ? "Yes" : "No"}</div>
            <div>Refresh: {row.refresh_token_configured ? "Yes" : "No"}</div>
            <div>Client Secret: {row.client_secret_configured ? "Yes" : "No"}</div>
          </div>
        ),
      },
      {
        key: "validated",
        title: "Last Validated",
        render: (row: SocialAccount) =>
          row.last_validated_at
            ? new Date(row.last_validated_at).toLocaleString()
            : "-",
      },
      {
        key: "status",
        title: "Status",
        render: (row: SocialAccount) => (
          <StatusBadge
            label={row.is_active ? "active" : "inactive"}
            tone={row.is_active ? "success" : "warning"}
          />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: SocialAccount) => (
          <div className="table-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => void handleValidate(row)}
              disabled={validatingId === row.id}
            >
              {validatingId === row.id ? "Validating..." : "Validate"}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditingAccount(row)}
            >
              Edit
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => setDeletingAccount(row)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [siteMap, validatingId]
  );

  return (
    <div>
      <PageHeader
        title="Social Accounts"
        description="Manage connected social media account configurations."
      />

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          Add Social Account
        </button>
      </div>

      {actionMessage ? (
        <div className="inline-message inline-message-success">{actionMessage}</div>
      ) : null}

      {actionError ? (
        <div className="inline-message inline-message-error">{actionError}</div>
      ) : null}

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load social accounts" description={error} />
      ) : null}

      {!loading && !error && accounts.length === 0 ? (
        <EmptyState
          title="No social accounts found"
          description="Create your first social account configuration."
        />
      ) : null}

      {!loading && !error && accounts.length > 0 ? (
        <DataTable columns={columns} rows={accounts} getRowKey={(row) => row.id} />
      ) : null}

      <SocialAccountModal
        open={isCreateOpen}
        title="Create Social Account"
        sourceSites={sites}
        loading={saving}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <SocialAccountModal
        open={!!editingAccount}
        title="Edit Social Account"
        sourceSites={sites}
        initialData={editingAccount}
        loading={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditingAccount(null)}
      />

      <ConfirmDialog
        open={!!deletingAccount}
        title="Delete Social Account"
        message={`Are you sure you want to delete "${deletingAccount?.name ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingAccount(null)}
      />
    </div>
  );
}