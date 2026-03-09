import type { SocialAccountPayload } from "../../types/socialAccount";
import type { SourceSite } from "../../types/sourceSite";
import SocialAccountForm from "./SocialAccountForm";

type SocialAccountModalProps = {
  open: boolean;
  title: string;
  sourceSites: SourceSite[];
  loading?: boolean;
  onSubmit: (payload: SocialAccountPayload) => Promise<void> | void;
  onClose: () => void;
};

export default function SocialAccountModal({
  open,
  title,
  sourceSites,
  loading = false,
  onSubmit,
  onClose,
}: SocialAccountModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-lg">
        <h3>{title}</h3>
        <SocialAccountForm
          sourceSites={sourceSites}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
