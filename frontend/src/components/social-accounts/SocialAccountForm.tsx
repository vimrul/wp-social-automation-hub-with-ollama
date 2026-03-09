import { useEffect, useState } from "react";
import type { SocialAccountPayload } from "../../types/socialAccount";
import type { SourceSite } from "../../types/sourceSite";

type SocialAccountFormProps = {
  sourceSites: SourceSite[];
  loading?: boolean;
  onSubmit: (payload: SocialAccountPayload) => Promise<void> | void;
  onCancel: () => void;
};

const defaultState: SocialAccountPayload = {
  source_site_id: 0,
  platform: "facebook",
  name: "",
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
  loading = false,
  onSubmit,
  onCancel,
}: SocialAccountFormProps) {
  const [form, setForm] = useState<SocialAccountPayload>(defaultState);

  useEffect(() => {
    if (sourceSites.length > 0 && form.source_site_id === 0) {
      setForm((prev) => ({ ...prev, source_site_id: sourceSites[0].id }));
    }
  }, [sourceSites, form.source_site_id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "source_site_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label>Source Site</label>
        <select
          name="source_site_id"
          value={form.source_site_id}
          onChange={handleChange}
          required
        >
          {sourceSites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Platform</label>
        <select name="platform" value={form.platform} onChange={handleChange}>
          <option value="facebook">facebook</option>
          <option value="twitter">twitter</option>
          <option value="x">x</option>
          <option value="linkedin">linkedin</option>
        </select>
      </div>

      <div className="form-field">
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Revlox Facebook"
          required
        />
      </div>

      <div className="form-field">
        <label>Account Identifier</label>
        <input
          name="account_identifier"
          value={form.account_identifier}
          onChange={handleChange}
          placeholder="@revlox or page name"
        />
      </div>

      <div className="form-field">
        <label>Page ID</label>
        <input
          name="page_id"
          value={form.page_id}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>App ID</label>
        <input
          name="app_id"
          value={form.app_id}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>App Secret</label>
        <input
          type="password"
          name="app_secret"
          value={form.app_secret}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Client ID</label>
        <input
          name="client_id"
          value={form.client_id}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Client Secret</label>
        <input
          type="password"
          name="client_secret"
          value={form.client_secret}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Access Token</label>
        <input
          type="password"
          name="access_token"
          value={form.access_token}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Refresh Token</label>
        <input
          type="password"
          name="refresh_token"
          value={form.refresh_token}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field form-field-full">
        <label>Account Metadata JSON</label>
        <textarea
          name="account_metadata_json"
          value={form.account_metadata_json}
          onChange={handleChange}
          placeholder='{"page_name":"Revlox"}'
          rows={4}
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