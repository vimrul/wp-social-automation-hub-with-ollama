import { useEffect, useState } from "react";
import type { SocialAccount, SocialAccountPayload } from "../../types/socialAccount";
import type { SourceSite } from "../../types/sourceSite";

type SocialAccountFormProps = {
  sourceSites: SourceSite[];
  initialData?: SocialAccount | null;
  loading?: boolean;
  onSubmit: (payload: SocialAccountPayload) => Promise<void> | void;
  onCancel: () => void;
};

type SocialAccountFormState = {
  name: string;
  platform: string;
  source_site_id: string;
  account_identifier: string;
  page_id: string;
  app_id: string;
  app_secret: string;
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  account_metadata_json: string;
  is_active: boolean;
};

const defaultState: SocialAccountFormState = {
  name: "",
  platform: "facebook",
  source_site_id: "",
  account_identifier: "",
  page_id: "",
  app_id: "",
  app_secret: "",
  client_id: "",
  client_secret: "",
  access_token: "",
  refresh_token: "",
  account_metadata_json: "",
  is_active: true,
};

export default function SocialAccountForm({
  sourceSites,
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: SocialAccountFormProps) {
  const [form, setForm] = useState<SocialAccountFormState>(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        platform: initialData.platform ?? "facebook",
        source_site_id:
          initialData.source_site_id !== null &&
          initialData.source_site_id !== undefined
            ? String(initialData.source_site_id)
            : "",
        account_identifier: initialData.account_identifier ?? "",
        page_id: initialData.page_id ?? "",
        app_id: initialData.app_id ?? "",
        app_secret: "",
        client_id: initialData.client_id ?? "",
        client_secret: "",
        access_token: "",
        refresh_token: "",
        account_metadata_json: initialData.account_metadata_json ?? "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      setForm(defaultState);
    }
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: SocialAccountPayload = {
      name: form.name.trim(),
      platform: form.platform,
      source_site_id: form.source_site_id ? Number(form.source_site_id) : null,
      account_identifier: form.account_identifier.trim() || undefined,
      page_id: form.page_id.trim() || undefined,
      app_id: form.app_id.trim() || undefined,
      app_secret: form.app_secret.trim() || undefined,
      client_id: form.client_id.trim() || undefined,
      client_secret: form.client_secret.trim() || undefined,
      access_token: form.access_token.trim() || undefined,
      refresh_token: form.refresh_token.trim() || undefined,
      account_metadata_json: form.account_metadata_json.trim() || undefined,
      is_active: form.is_active,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Revlox Facebook Page"
          required
        />
      </div>

      <div className="form-field">
        <label>Platform</label>
        <select name="platform" value={form.platform} onChange={handleChange}>
          <option value="facebook">facebook</option>
          <option value="twitter">twitter</option>
          <option value="x">x</option>
        </select>
      </div>

      <div className="form-field">
        <label>Source Site</label>
        <select
          name="source_site_id"
          value={form.source_site_id}
          onChange={handleChange}
        >
          <option value="">Select source site</option>
          {sourceSites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Account Identifier</label>
        <input
          name="account_identifier"
          value={form.account_identifier}
          onChange={handleChange}
          placeholder="@myhandle or page name"
        />
      </div>

      <div className="form-field">
        <label>Page ID</label>
        <input
          name="page_id"
          value={form.page_id}
          onChange={handleChange}
          placeholder="Facebook page ID"
        />
      </div>

      <div className="form-field">
        <label>App ID</label>
        <input
          name="app_id"
          value={form.app_id}
          onChange={handleChange}
          placeholder="Platform app ID"
        />
      </div>

      <div className="form-field">
        <label>App Secret</label>
        <input
          name="app_secret"
          type="password"
          value={form.app_secret}
          onChange={handleChange}
          placeholder={initialData ? "Leave blank to keep existing" : "App secret"}
        />
      </div>

      <div className="form-field">
        <label>Client ID</label>
        <input
          name="client_id"
          value={form.client_id}
          onChange={handleChange}
          placeholder="OAuth client ID"
        />
      </div>

      <div className="form-field">
        <label>Client Secret</label>
        <input
          name="client_secret"
          type="password"
          value={form.client_secret}
          onChange={handleChange}
          placeholder={initialData ? "Leave blank to keep existing" : "OAuth client secret"}
        />
      </div>

      <div className="form-field">
        <label>Access Token</label>
        <textarea
          name="access_token"
          rows={3}
          value={form.access_token}
          onChange={handleChange}
          placeholder={initialData ? "Leave blank to keep existing" : "Access token"}
        />
      </div>

      <div className="form-field">
        <label>Refresh Token</label>
        <textarea
          name="refresh_token"
          rows={3}
          value={form.refresh_token}
          onChange={handleChange}
          placeholder={initialData ? "Leave blank to keep existing" : "Refresh token"}
        />
      </div>

      <div className="form-field form-field-full">
        <label>Account Metadata JSON</label>
        <textarea
          name="account_metadata_json"
          rows={4}
          value={form.account_metadata_json}
          onChange={handleChange}
          placeholder='{"page_name":"Revlox"}'
        />
      </div>

      <div className="form-field form-field-checkbox">
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active
        </label>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}