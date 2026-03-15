import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SocialAccountModal from "../components/social-accounts/SocialAccountModal";
import { getSourceSites } from "../api/sourceSites";
import { getFacebookConnectUrl, getXConnectUrl } from "../api/oauth";
import {
  createSocialAccount,
  deleteSocialAccount,
  getSocialAccounts,
  updateSocialAccount,
  validateSocialAccount,
} from "../api/socialAccounts";
import type { SocialAccount, SocialAccountPayload } from "../types/socialAccount";
import type { SourceSite } from "../types/sourceSite";

/**
 * Social accounts management page.
 *
 * Features:
 * - list connected social accounts
 * - create new account
 * - edit existing account
 * - validate account credentials
 * - delete account
 * - start OAuth flow for X and Facebook
 */
export default function SocialAccountsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState<string>("");

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SocialAccount | null>(null);

  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");

  /**
   * Load both social accounts and source sites together.
   */
  const loadData = async (): Promise<void> => {
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
      console.error("Failed to load social accounts page data:", err);
      setError("Failed to load social accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  /**
   * Create a new social account.
   */
  const handleCreate = async (payload: SocialAccountPayload): Promise<void> => {
    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      await createSocialAccount(payload);
      setIsCreateOpen(false);
      setActionMessage("Social account created successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to create social account:", err);
      setActionError("Failed to create social account.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update an existing social account.
   */
  const handleUpdate = async (payload: SocialAccountPayload): Promise<void> => {
    if (!editingAccount) {
      return;
    }

    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      await updateSocialAccount(editingAccount.id, payload);
      setEditingAccount(null);
      setActionMessage("Social account updated successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to update social account:", err);
      setActionError("Failed to update social account.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete selected social account.
   */
  const handleDelete = async (): Promise<void> => {
    if (!deletingAccount) {
      return;
    }

    try {
      setSaving(true);
      setActionMessage("");
      setActionError("");

      const result = await deleteSocialAccount(deletingAccount.id);
      setDeletingAccount(null);
      setActionMessage(result.message || "Social account deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to delete social account:", err);
      setActionError("Failed to delete social account.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Validate tokens / credentials of a social account.
   */
  const handleValidate = async (account: SocialAccount): Promise<void> => {
    try {
      setValidatingId(account.id);
      setActionMessage("");
      setActionError("");

      const result = await validateSocialAccount(account.id);
      setActionMessage(result.message || "Social account validated successfully.");
      await loadData();
    } catch (err: any) {
      console.error("Failed to validate social account:", err);
      setActionError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to validate social account."
      );
    } finally {
      setValidatingId(null);
    }
  };

  /**
   * Start OAuth flow for X.
   */
  const handleConnectX = async (): Promise<void> => {
    try {
      setActionMessage("");
      setActionError("");

      const result = await getXConnectUrl();
      window.location.href = result.authorization_url;
    } catch (err) {
      console.error("Failed to start X OAuth flow:", err);
      setActionError("Failed to start X OAuth flow.");
    }
  };

  /**
   * Start OAuth flow for Facebook.
   */
  const handleConnectFacebook = async (): Promise<void> => {
    try {
      setActionMessage("");
      setActionError("");

      const result = await getFacebookConnectUrl();
      window.location.href = result.authorization_url;
    } catch (err) {
      console.error("Failed to start Facebook OAuth flow:", err);
      setActionError("Failed to start Facebook OAuth flow.");
    }
  };

  /**
   * Quick lookup for source site names by ID.
   */
  const siteMap = useMemo(() => {
    return new Map<number, string>(sites.map((site) => [site.id, site.name]));
  }, [sites]);

  /**
   * Data table column definitions.
   */
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

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Social Accounts"
          description="Manage connected social media account configurations."
        />
        <Loader />
      </div>
    );
  }

  if (error) {
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
          <button className="btn btn-secondary" onClick={handleConnectX}>
            Connect X
          </button>
          <button className="btn btn-secondary" onClick={handleConnectFacebook}>
            Connect Facebook
          </button>
        </div>

        <EmptyState title="Unable to load social accounts" description={error} />
      </div>
    );
  }

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
        <button className="btn btn-secondary" onClick={handleConnectX}>
          Connect X
        </button>
        <button className="btn btn-secondary" onClick={handleConnectFacebook}>
          Connect Facebook
        </button>
      </div>

      {actionMessage ? (
        <div className="inline-message inline-message-success">{actionMessage}</div>
      ) : null}

      {actionError ? (
        <div className="inline-message inline-message-error">{actionError}</div>
      ) : null}

      {accounts.length === 0 ? (
        <EmptyState
          title="No social accounts found"
          description="Create your first social account configuration."
        />
      ) : (
        <DataTable columns={columns} rows={accounts} getRowKey={(row) => row.id} />
      )}

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