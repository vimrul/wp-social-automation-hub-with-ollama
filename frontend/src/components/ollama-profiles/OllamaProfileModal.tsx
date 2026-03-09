import type { OllamaProfile, OllamaProfilePayload } from "../../types/ollamaProfile";
import OllamaProfileForm from "./OllamaProfileForm";

type OllamaProfileModalProps = {
  open: boolean;
  title: string;
  initialData?: OllamaProfile | null;
  loading?: boolean;
  onSubmit: (payload: OllamaProfilePayload) => Promise<void> | void;
  onClose: () => void;
};

export default function OllamaProfileModal({
  open,
  title,
  initialData,
  loading = false,
  onSubmit,
  onClose,
}: OllamaProfileModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-lg">
        <h3>{title}</h3>
        <OllamaProfileForm
          initialData={initialData}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
