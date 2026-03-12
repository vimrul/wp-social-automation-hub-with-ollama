import type {
  PromptTemplate,
  PromptTemplatePayload,
} from "../../types/promptTemplate";
import PromptTemplateForm from "./PromptTemplateForm";

type PromptTemplateModalProps = {
  open: boolean;
  title: string;
  initialData?: PromptTemplate | null;
  loading?: boolean;
  onSubmit: (payload: PromptTemplatePayload) => Promise<void> | void;
  onClose: () => void;
};

export default function PromptTemplateModal({
  open,
  title,
  initialData,
  loading = false,
  onSubmit,
  onClose,
}: PromptTemplateModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-xl">
        <h3>{title}</h3>
        <PromptTemplateForm
          initialData={initialData}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
