import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ambulanceService } from "../../services/ambulanceService";
import { medicalCenterService } from "../../services/medicalCenterService";

const STATUS_OPTIONS = ["AVAILABLE", "EN_ROUTE", "ON_MISSION", "MAINTENANCE", "OUT_OF_SERVICE"];
const STATUS_TAG_CLASS = {
  AVAILABLE: "available",
  EN_ROUTE: "busy",
  ON_MISSION: "busy",
  MAINTENANCE: "offline",
  OUT_OF_SERVICE: "offline",
};

const EMPTY_CREATE_FORM = { registrationNumber: "", model: "", medicalCenterId: "" };

export default function RegulationAmbulancesPage() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = useCallback(() => {
    ambulanceService.list({ size: 100 })
      .then((data) => setAmbulances(data.content || []))
      .catch(() => toast.error("Impossible de charger les ambulances."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (amb, status) => {
    setBusyId(amb.id);
    try {
      await ambulanceService.updateStatus(amb.id, status);
      toast.success(`${amb.registrationNumber} -> ${status}`);
      load();
    } catch {
      toast.error("Echec du changement de statut.");
    } finally {
      setBusyId(null);
    }
  };

  const openCreateModal = async () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setShowCreateModal(true);
    try {
      const centersRes = await medicalCenterService.list({ size: 200 });
      setMedicalCenters(centersRes.content || []);
    } catch {
      toast.error("Impossible de charger les centres medicaux.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await ambulanceService.create(createForm);
      toast.success("Ambulance creee avec succes.");
      setShowCreateModal(false);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Impossible de creer cette ambulance.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const availableCount = ambulances.filter((a) => a.status === "AVAILABLE").length;

  return (
    <>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h2 className="reg-page-title">Ambulances</h2>
          <p className="reg-page-subtitle">{availableCount} disponible(s) sur {ambulances.length}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
          + Nouvelle ambulance
        </button>
      </div>

      <div className="reg-panel">
        {loading ? (
          <div className="reg-loading">Chargement...</div>
        ) : ambulances.length === 0 ? (
          <div className="reg-empty-state">Aucune ambulance enregistree.</div>
        ) : (
          <div className="reg-table-responsive">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Immatriculation</th>
                  <th>Modele</th>
                  <th>Centre medical</th>
                  <th>Statut</th>
                  <th>Changer le statut</th>
                </tr>
              </thead>
              <tbody>
                {ambulances.map((amb) => (
                  <tr key={amb.id}>
                    <td>{amb.registrationNumber}</td>
                    <td>{amb.model}</td>
                    <td>{amb.medicalCenterName || "-"}</td>
                    <td><span className={`reg-status-tag ${STATUS_TAG_CLASS[amb.status] || "offline"}`}>{amb.status}</span></td>
                    <td>
                      <select
                        className="reg-select"
                        value={amb.status}
                        disabled={busyId === amb.id}
                        onChange={(e) => handleStatusChange(amb, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Nouvelle ambulance</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}

                  <div className="mb-2">
                    <label className="form-label small">Numero d'immatriculation</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={createForm.registrationNumber}
                      onChange={(e) => setCreateForm({ ...createForm, registrationNumber: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Modele</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={createForm.model}
                      onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Centre medical</label>
                    <select
                      className="form-select"
                      required
                      value={createForm.medicalCenterId}
                      onChange={(e) => setCreateForm({ ...createForm, medicalCenterId: e.target.value })}
                    >
                      <option value="">Choisir un centre...</option>
                      {medicalCenters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? "Creation..." : "Creer l'ambulance"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}