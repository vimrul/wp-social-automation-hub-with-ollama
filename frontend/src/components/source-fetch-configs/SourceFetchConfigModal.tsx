import type { SourceSite } from "../../types/sourceSite";
import type {
  SourceFetchConfig,
  SourceFetchConfigPayload,
} from "../../types/sourceFetchConfig";
import SourceFetchConfigForm from "./SourceFetchConfigForm";

type SourceFetchConfigModalProps = {
  open: boolean;
  title: string;
  sourceSites: SourceSite[];
  initialData?: SourceFetchConfig | null;
  loading?: boolean;
  onSubmit: (payload: SourceFetchConfigPayload) => Promise<void> | void;
  onClose: () => void;
};

export default function SourceFetchConfigModal({
  open,
  title,
  sourceSites,
  initialData,
  loading = false,
  onSubmit,
  onClose,
}: SourceFetchConfigModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-xl">
        <h3>{title}</h3>
        <SourceFetchConfigForm
          sourceSites={sourceSites}
          initialData={initialData}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
