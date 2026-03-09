import { useEffect, useState } from "react";
import type { SourceSite, SourceSitePayload } from "../../types/sourceSite";

type SourceSiteFormProps = {
  initialData?: SourceSite | null;
  loading?: boolean;
  onSubmit: (payload: SourceSitePayload) => Promise<void> | void;
  onCancel: () => void;
};

const defaultState: SourceSitePayload = {
  name: "",
  base_url: "",
  site_type: "wordpress",
  description: "",
  default_language: "en",
  timezone: "Asia/Dhaka",
  is_active: true,
};

export default function SourceSiteForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: SourceSiteFormProps) {
  const [form, setForm] = useState<SourceSitePayload>(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        base_url: initialData.base_url ?? "",
        site_type: initialData.site_type ?? "wordpress",
        description: initialData.description ?? "",
        default_language: initialData.default_language ?? "en",
        timezone: initialData.timezone ?? "Asia/Dhaka",
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
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Revlox"
          required
        />
      </div>

      <div className="form-field">
        <label>Base URL</label>
        <input
          name="base_url"
          value={form.base_url}
          onChange={handleChange}
          placeholder="https://www.revlox.com"
          required
        />
      </div>

      <div className="form-field">
        <label>Site Type</label>
        <select name="site_type" value={form.site_type} onChange={handleChange}>
          <option value="wordpress">wordpress</option>
          <option value="custom">custom</option>
        </select>
      </div>

      <div className="form-field">
        <label>Default Language</label>
        <input
          name="default_language"
          value={form.default_language}
          onChange={handleChange}
          placeholder="en"
        />
      </div>

      <div className="form-field">
        <label>Timezone</label>
        <input
          name="timezone"
          value={form.timezone}
          onChange={handleChange}
          placeholder="Asia/Dhaka"
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

      <div className="form-field form-field-full">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Main content source site"
          rows={4}
        />
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
