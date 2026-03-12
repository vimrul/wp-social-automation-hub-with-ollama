import { useEffect, useState } from "react";

type ImportOptionsModalProps = {
  open: boolean;
  configName?: string;
  loading?: boolean;
  onSubmit: (payload: { per_page?: number; page?: number }) => Promise<void> | void;
  onClose: () => void;
};

export default function ImportOptionsModal({
  open,
  configName,
  loading = false,
  onSubmit,
  onClose,
}: ImportOptionsModalProps) {
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (open) {
      setPerPage(10);
      setPage(1);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      per_page: perPage || undefined,
      page: page || undefined,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Run Import</h3>
        <p className="muted">
          {configName ? `Config: ${configName}` : "Choose import options for this run."}
        </p>

        <form onSubmit={handleSubmit} className="form-grid form-grid-single">
          <div className="form-field">
            <label>Per Page</label>
            <input
              type="number"
              min={1}
              max={100}
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            />
          </div>

          <div className="form-field">
            <label>Page</label>
            <input
              type="number"
              min={1}
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Importing..." : "Run Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
