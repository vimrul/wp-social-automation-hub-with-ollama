import { useEffect, useState } from "react";
import type { SourceSite } from "../../types/sourceSite";
import type {
  SourceFetchConfig,
  SourceFetchConfigPayload,
} from "../../types/sourceFetchConfig";

type SourceFetchConfigFormProps = {
  sourceSites: SourceSite[];
  initialData?: SourceFetchConfig | null;
  loading?: boolean;
  onSubmit: (payload: SourceFetchConfigPayload) => Promise<void> | void;
  onCancel: () => void;
};

const defaultState: SourceFetchConfigPayload = {
  source_site_id: 0,
  fetch_name: "",
  fetch_url: "",
  http_method: "GET",
  auth_type: "none",
  auth_username: "",
  auth_password_encrypted: "",
  auth_token_encrypted: "",
  request_headers_json: "",
  query_params_json: "",
  content_path: "",
  title_field: "title.rendered",
  slug_field: "slug",
  content_field: "content.rendered",
  excerpt_field: "excerpt.rendered",
  published_at_field: "date",
  modified_at_field: "modified",
  featured_image_field: "yoast_head_json.og_image.0.url",
  source_id_field: "id",
  status_field: "status",
  category_field: "categories",
  tag_field: "tags",
  is_active: true,
};

export default function SourceFetchConfigForm({
  sourceSites,
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: SourceFetchConfigFormProps) {
  const [form, setForm] = useState<SourceFetchConfigPayload>(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        source_site_id: initialData.source_site_id ?? 0,
        fetch_name: initialData.fetch_name ?? "",
        fetch_url: initialData.fetch_url ?? "",
        http_method: initialData.http_method ?? "GET",
        auth_type: initialData.auth_type ?? "none",
        auth_username: initialData.auth_username ?? "",
        auth_password_encrypted: "",
        auth_token_encrypted: "",
        request_headers_json: initialData.request_headers_json ?? "",
        query_params_json: initialData.query_params_json ?? "",
        content_path: initialData.content_path ?? "",
        title_field: initialData.title_field ?? "title.rendered",
        slug_field: initialData.slug_field ?? "slug",
        content_field: initialData.content_field ?? "content.rendered",
        excerpt_field: initialData.excerpt_field ?? "excerpt.rendered",
        published_at_field: initialData.published_at_field ?? "date",
        modified_at_field: initialData.modified_at_field ?? "modified",
        featured_image_field:
          initialData.featured_image_field ?? "yoast_head_json.og_image.0.url",
        source_id_field: initialData.source_id_field ?? "id",
        status_field: initialData.status_field ?? "status",
        category_field: initialData.category_field ?? "categories",
        tag_field: initialData.tag_field ?? "tags",
        is_active: initialData.is_active ?? true,
      });
    } else if (sourceSites.length > 0) {
      setForm((prev) => ({
        ...prev,
        source_site_id: prev.source_site_id || sourceSites[0].id,
      }));
    }
  }, [initialData, sourceSites]);

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
        <label>Fetch Name</label>
        <input
          name="fetch_name"
          value={form.fetch_name}
          onChange={handleChange}
          placeholder="Revlox Posts API"
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
        <label>Method</label>
        <select name="http_method" value={form.http_method} onChange={handleChange}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div className="form-field form-field-full">
        <label>Fetch URL</label>
        <input
          name="fetch_url"
          value={form.fetch_url}
          onChange={handleChange}
          placeholder="https://www.revlox.com/drupal-json/wp/v2/posts"
          required
        />
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
          name="auth_password_encrypted"
          value={form.auth_password_encrypted}
          onChange={handleChange}
          placeholder="optional"
        />
      </div>

      <div className="form-field form-field-full">
        <label>Auth Token</label>
        <input
          type="password"
          name="auth_token_encrypted"
          value={form.auth_token_encrypted}
          onChange={handleChange}
          placeholder="optional bearer token"
        />
      </div>

      <div className="form-field form-field-full">
        <label>Headers JSON</label>
        <textarea
          name="request_headers_json"
          value={form.request_headers_json}
          onChange={handleChange}
          rows={3}
          placeholder='{"Authorization":"Bearer ..."}'
        />
      </div>

      <div className="form-field form-field-full">
        <label>Query Params JSON</label>
        <textarea
          name="query_params_json"
          value={form.query_params_json}
          onChange={handleChange}
          rows={3}
          placeholder='{"per_page":10,"page":1}'
        />
      </div>

      <div className="form-field">
        <label>Content Path</label>
        <input
          name="content_path"
          value={form.content_path}
          onChange={handleChange}
          placeholder="data.items"
        />
      </div>

      <div className="form-field">
        <label>Source ID Field</label>
        <input
          name="source_id_field"
          value={form.source_id_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Slug Field</label>
        <input
          name="slug_field"
          value={form.slug_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Title Field</label>
        <input
          name="title_field"
          value={form.title_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Excerpt Field</label>
        <input
          name="excerpt_field"
          value={form.excerpt_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Content Field</label>
        <input
          name="content_field"
          value={form.content_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Featured Image Field</label>
        <input
          name="featured_image_field"
          value={form.featured_image_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Published At Field</label>
        <input
          name="published_at_field"
          value={form.published_at_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Modified At Field</label>
        <input
          name="modified_at_field"
          value={form.modified_at_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Status Field</label>
        <input
          name="status_field"
          value={form.status_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Category Field</label>
        <input
          name="category_field"
          value={form.category_field}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label>Tag Field</label>
        <input
          name="tag_field"
          value={form.tag_field}
          onChange={handleChange}
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