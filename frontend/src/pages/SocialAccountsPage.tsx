import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import SocialAccountModal from "../components/social-accounts/SocialAccountModal";
import { getSourceSites } from "../api/sourceSites";
import { createSocialAccount, getSocialAccounts } from "../api/socialAccounts";
import type { SocialAccount, SocialAccountPayload } from "../types/socialAccount";
import type { SourceSite } from "../types/sourceSite";

export default function SocialAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      await createSocialAccount(payload);
      setIsCreateOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create social account.");
    } finally {
      setSaving(false);
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
        render: (row: SocialAccount) => siteMap.get(row.source_site_id) || row.source_site_id,
      },
      {
        key: "page_id",
        title: "Page ID",
        render: (row: SocialAccount) => row.page_id || "-",
      },
      {
        key: "client_id",
        title: "Client ID",
        render: (row: SocialAccount) => row.client_id || "-",
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
    ],
    [siteMap]
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
    </div>
  );
}
