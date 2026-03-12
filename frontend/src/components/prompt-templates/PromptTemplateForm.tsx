import { useEffect, useState } from "react";
import type {
  PromptTemplate,
  PromptTemplatePayload,
} from "../../types/promptTemplate";

type PromptTemplateFormProps = {
  initialData?: PromptTemplate | null;
  loading?: boolean;
  onSubmit: (payload: PromptTemplatePayload) => Promise<void> | void;
  onCancel: () => void;
};

const defaultState: PromptTemplatePayload = {
  name: "",
  platform: "twitter",
  template_type: "summary",
  system_prompt: "",
  user_prompt_template: "",
  output_format: "text",
  is_active: true,
  notes: "",
};

export default function PromptTemplateForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: PromptTemplateFormProps) {
  const [form, setForm] = useState<PromptTemplatePayload>(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        platform: initialData.platform ?? "twitter",
        template_type: initialData.template_type ?? "summary",
        system_prompt: initialData.system_prompt ?? "",
        user_prompt_template: initialData.user_prompt_template ?? "",
        output_format: initialData.output_format ?? "text",
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
          placeholder="Twitter Summary Default"
          required
        />
      </div>

      <div className="form-field">
        <label>Platform</label>
        <select name="platform" value={form.platform} onChange={handleChange}>
          <option value="twitter">twitter</option>
          <option value="facebook">facebook</option>
          <option value="linkedin">linkedin</option>
          <option value="generic">generic</option>
        </select>
      </div>

      <div className="form-field">
        <label>Template Type</label>
        <select
          name="template_type"
          value={form.template_type}
          onChange={handleChange}
        >
          <option value="summary">summary</option>
          <option value="hashtags">hashtags</option>
          <option value="caption">caption</option>
          <option value="rewrite">rewrite</option>
          <option value="generic">generic</option>
        </select>
      </div>

      <div className="form-field">
        <label>Output Format</label>
        <select
          name="output_format"
          value={form.output_format}
          onChange={handleChange}
        >
          <option value="text">text</option>
          <option value="json">json</option>
          <option value="markdown">markdown</option>
        </select>
      </div>

      <div className="form-field form-field-full">
        <label>System Prompt</label>
        <textarea
          name="system_prompt"
          value={form.system_prompt}
          onChange={handleChange}
          rows={8}
          placeholder="You are a social media content assistant..."
        />
      </div>

      <div className="form-field form-field-full">
        <label>User Prompt Template</label>
        <textarea
          name="user_prompt_template"
          value={form.user_prompt_template}
          onChange={handleChange}
          rows={10}
          placeholder="Write a short Twitter summary for this post: {{title}} {{content}}"
        />
      </div>

      <div className="form-field form-field-full">
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Default prompt for concise platform summaries"
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
