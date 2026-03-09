import { useEffect, useState } from "react";
import type { OllamaProfile, OllamaProfilePayload } from "../../types/ollamaProfile";

type OllamaProfileFormProps = {
  initialData?: OllamaProfile | null;
  loading?: boolean;
  onSubmit: (payload: OllamaProfilePayload) => Promise<void> | void;
  onCancel: () => void;
};

const defaultState: OllamaProfilePayload = {
  name: "",
  base_url: "http://127.0.0.1:11434",
  model_name: "",
  auth_type: "none",
  auth_username: "",
  auth_password: "",
  bearer_token: "",
  custom_headers_json: "",
  timeout_seconds: 120,
  is_default: false,
  is_active: true,
  notes: "",
};

export default function OllamaProfileForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: OllamaProfileFormProps) {
  const [form, setForm] = useState<OllamaProfilePayload>(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        base_url: initialData.base_url ?? "http://127.0.0.1:11434",
        model_name: initialData.model_name ?? "",
        auth_type: initialData.auth_type ?? "none",
        auth_username: initialData.auth_username ?? "",
        auth_password: "",
        bearer_token: "",
        custom_headers_json: initialData.custom_headers_json ?? "",
        timeout_seconds: initialData.timeout_seconds ?? 120,
        is_default: initialData.is_default ?? false,
        is_active: initialData.is_active ?? true,
        notes: initialData.notes ?? "",
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

    setForm((prev) => ({
      ...prev,
      [name]: name === "timeout_seconds" ? Number(value) : value,
    }));
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
          placeholder="Local Ollama"
          required
        />
      </div>

      <div className="form-field">
        <label>Base URL</label>
        <input
          name="base_url"
          value={form.base_url}
          onChange={handleChange}
          placeholder="http://127.0.0.1:11434"
          required
        />
      </div>

      <div className="form-field">
        <label>Model Name</label>
        <input
          name="model_name"
          value={form.model_name}
          onChange={handleChange}
          placeholder="llama3.1:8b"
          required
        />
      </div>

      <div className="form-field">
        <label>Auth Type</label>
        <select name="auth_type" value={form.auth_type} onChange={handleChange}>
          <option value="none">none</option>
          <option value="basic">basic</option>
          <option value="bearer">bearer</option>
        </select>
      </div>

      <div className="form-field">
        <label>Auth Username</label>
        <input
          name="auth_username"
          value={form.auth_username}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Auth Password</label>
        <input
          type="password"
          name="auth_password"
          value={form.auth_password}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Bearer Token</label>
        <input
          type="password"
          name="bearer_token"
          value={form.bearer_token}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field">
        <label>Timeout Seconds</label>
        <input
          type="number"
          name="timeout_seconds"
          value={form.timeout_seconds}
          onChange={handleChange}
          min={1}
        />
      </div>

      <div className="form-field form-field-full">
        <label>Custom Headers JSON</label>
        <textarea
          name="custom_headers_json"
          value={form.custom_headers_json}
          onChange={handleChange}
          placeholder='{"X-API-Key":"value"}'
          rows={4}
        />
      </div>

      <div className="form-field form-field-full">
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Primary local inference profile"
          rows={4}
        />
      </div>

      <div className="form-field form-field-checkbox">
        <label>
          <input
            type="checkbox"
            name="is_default"
            checked={form.is_default}
            onChange={handleChange}
          />
          Default Profile
        </label>
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
