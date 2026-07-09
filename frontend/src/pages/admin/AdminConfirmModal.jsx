import { useState, useEffect } from "react";

export default function AdminConfirmModal({
  show,
  title,
  description,
  dangerous = false,
  confirmLabel = "Confirmer",
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setReason("");
      setChecked(false);
      setSubmitting(false);
    }
  }, [show]);

  if (!show) return null;

  const canConfirm = reason.trim().length > 0 && (!dangerous || checked);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onCancel}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              {dangerous && <span>⚠️</span>}
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            {description && <p className="small text-secondary">{description}</p>}

            <label className="form-label small fw-semibold">Motif de l'action (obligatoire)</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Expliquez pourquoi cette action est nécessaire..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />

            {dangerous && (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="admin-confirm-checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="admin-confirm-checkbox">
                  Je comprends que cette action est irréversible et je confirme vouloir la réaliser.
                </label>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
              Annuler
            </button>
            <button
              type="button"
              className={`btn ${dangerous ? "btn-danger" : "btn-warning"}`}
              disabled={!canConfirm || submitting}
              onClick={handleConfirm}
            >
              {submitting ? "En cours..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}