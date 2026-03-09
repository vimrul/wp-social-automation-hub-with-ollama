import type { SourceSite, SourceSitePayload } from "../../types/sourceSite";
import SourceSiteForm from "./SourceSiteForm";

type SourceSiteModalProps = {
  open: boolean;
  title: string;
  initialData?: SourceSite | null;
  loading?: boolean;
  onSubmit: (payload: SourceSitePayload) => Promise<void> | void;
  onClose: () => void;
};

export default function SourceSiteModal({
  open,
  title,
  initialData,
  loading = false,
  onSubmit,
  onClose,
}: SourceSiteModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-lg">
        <h3>{title}</h3>
        <SourceSiteForm
          initialData={initialData}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
