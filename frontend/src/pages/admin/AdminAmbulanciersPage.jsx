import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ambulancierService } from "../../services/ambulancierService";
import { ambulanceService } from "../../services/ambulanceService";
import { userService } from "../../services/userService";
import { medicalCenterService } from "../../services/medicalCenterService";
import AdminConfirmModal from "./AdminConfirmModal";

const PAGE_SIZE = 10;
const EMPTY_CREATE_FORM = { userId: "", medicalCenterId: "" };
const STATUS_OPTIONS = ["OFF_DUTY", "ON_DUTY", "EN_ROUTE", "ON_MISSION", "BREAK"];
const STATUS_LABELS = {
  OFF_DUTY: "Hors service", ON_DUTY: "En service", EN_ROUTE: "En route",
  ON_MISSION: "En mission", BREAK: "En pause",
};

export default function AdminAmbulanciersPage() {
  const [ambulanciers, setAmbulanciers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selected, setSelected] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const [pendingAction, setPendingAction] = useState(null); // "vehicle" | "unassign"

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = () => {
    setLoading(true);
    ambulancierService.list({ size: 200 })
      .then((data) => setAmbulanciers(data.content || []))
      .catch(() => toast.error("Impossible de charger la liste des ambulanciers."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return ambulanciers.filter((a) => {
      const fullName = `${a.userFirstName || ""} ${a.userLastName || ""}`.toLowerCase();
      return !search || fullName.includes(search.toLowerCase()) || (a.matricule || "").toLowerCase().includes(search.toLowerCase());
    });
  }, [ambulanciers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  const openDetail = async (ambulancier) => {
    setSelected(ambulancier);
    setSelectedVehicleId("");
    try {
      const vehiclesRes = await ambulanceService.list({ status: "AVAILABLE", size: 100 });
      setAvailableVehicles(vehiclesRes.content || []);
    } catch {
      toast.error("Impossible de charger les ambulances disponibles.");
    }
  };

  const confirmAssignVehicle = async (reason) => {
    if (!selectedVehicleId) return;
    try {
      const updated = await ambulancierService.assignVehicle(selected.id, selectedVehicleId);
      toast.success(`Ambulance assignée. Motif : ${reason}`);
      setPendingAction(null);
      setSelected(updated);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de l'affectation du véhicule.");
      setPendingAction(null);
    }
  };

  const confirmUnassignVehicle = async (reason) => {
    try {
      const updated = await ambulancierService.assignVehicle(selected.id, null);
      toast.success(`Véhicule retiré. Motif : ${reason}`);
      setPendingAction(null);
      setSelected(updated);
      load();
    } catch {
      toast.error("Échec du retrait du véhicule.");
      setPendingAction(null);
    }
  };

  const openCreateModal = async () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setShowCreateModal(true);
    try {
      const [usersRes, centersRes] = await Promise.all([
        userService.listUsers({ role: "AMBULANCIER", size: 200 }),
        medicalCenterService.list({ size: 200 }),
      ]);
      const alreadyLinkedIds = new Set(ambulanciers.map((a) => a.userId));
      setEligibleUsers((usersRes.content || []).filter((u) => !alreadyLinkedIds.has(u.id)));
      setMedicalCenters(centersRes.content || []);
    } catch {
      toast.error("Impossible de charger les utilisateurs et centres médicaux.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await ambulancierService.create(createForm);
      toast.success("Ambulancier créé avec succès.");
      setShowCreateModal(false);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Impossible de créer cet ambulancier.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (loading) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner d-flex justify-content-between align-items-center">
        <span>🛡️ Vue de supervision des ambulanciers. L'affectation d'un véhicule exige un motif obligatoire.</span>
        <button type="button" className="btn btn-sm btn-primary" onClick={openCreateModal}>
          + Nouvel ambulancier
        </button>
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total ambulanciers</div>
          <div className="admin-kpi-value">{ambulanciers.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Disponibles</div>
          <div className="admin-kpi-value">{ambulanciers.filter((a) => a.available).length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Avec véhicule assigné</div>
          <div className="admin-kpi-value">{ambulanciers.filter((a) => a.currentAmbulanceId).length}</div>
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className={selected ? "col-lg-7" : "col-12"}>
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>Liste des ambulanciers</span>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: "220px" }}
                placeholder="Rechercher nom, matricule..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Matricule</th>
                    <th>Centre médical</th>
                    <th>Statut</th>
                    <th>Véhicule</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => openDetail(a)}
                      style={{ cursor: "pointer", background: selected?.id === a.id ? "#f8f9fa" : "transparent" }}
                    >
                      <td>{a.userFirstName} {a.userLastName}</td>
                      <td className="small text-secondary">{a.matricule}</td>
                      <td className="small text-secondary">{a.medicalCenterName}</td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-dark">{STATUS_LABELS[a.currentStatus] || a.currentStatus}</span></td>
                      <td>
                        {a.currentAmbulanceRegistrationNumber ? (
                          <span className="badge bg-success">{a.currentAmbulanceRegistrationNumber}</span>
                        ) : (
                          <span className="text-secondary small">Aucun</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-secondary py-4">Aucun ambulancier ne correspond.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                <span className="small text-secondary">Page {page + 1} sur {totalPages}</span>
                <div className="btn-group">
                  <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Précédent</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Suivant</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="col-lg-5">
            <div className="admin-panel">
              <div className="admin-panel-header d-flex justify-content-between align-items-center">
                <span>Fiche ambulancier</span>
                <button type="button" className="btn-close" onClick={() => setSelected(null)} />
              </div>
              <div className="p-3">
                <h6 className="fw-bold mb-1">{selected.userFirstName} {selected.userLastName}</h6>
                <p className="small text-secondary mb-3">{selected.userEmail}</p>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small text-secondary">Matricule</div>
                    <div className="fw-semibold small">{selected.matricule}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Centre médical</div>
                    <div className="fw-semibold small">{selected.medicalCenterName}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Statut</div>
                    <div className="fw-semibold small">{STATUS_LABELS[selected.currentStatus] || selected.currentStatus}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Véhicule actuel</div>
                    <div className="fw-semibold small">{selected.currentAmbulanceRegistrationNumber || "Aucun"}</div>
                  </div>
                </div>

                <div className="admin-intervention-zone">
                  <div className="admin-intervention-label">🛡️ Zone d'intervention administrative</div>

                  {selected.currentAmbulanceId ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={() => setPendingAction("unassign")}
                    >
                      Retirer le véhicule actuel
                    </button>
                  ) : (
                    <>
                      <select
                        className="form-select form-select-sm mb-2"
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                      >
                        <option value="">Choisir une ambulance disponible...</option>
                        {availableVehicles.map((v) => (
                          <option key={v.id} value={v.id}>{v.registrationNumber} — {v.medicalCenterName}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning w-100"
                        disabled={!selectedVehicleId}
                        onClick={() => setPendingAction("vehicle")}
                      >
                        Assigner ce véhicule
                      </button>
                      {availableVehicles.length === 0 && (
                        <p className="small text-secondary mt-2 mb-0">Aucune ambulance disponible actuellement.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Nouvel ambulancier</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}

                  <div className="mb-2">
                    <label className="form-label small">Compte utilisateur (rôle Ambulancier)</label>
                    <select
                      className="form-select"
                      required
                      value={createForm.userId}
                      onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                    >
                      <option value="">Choisir un utilisateur...</option>
                      {eligibleUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.email}</option>
                      ))}
                    </select>
                    {eligibleUsers.length === 0 && (
                      <div className="form-text text-warning">
                        Aucun utilisateur disponible. Créez d'abord un compte avec le rôle AMBULANCIER dans l'onglet Utilisateurs.
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Centre médical</label>
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

                  <div className="mb-2">
                    <p className="small text-secondary mb-0">
                      Le matricule sera genere automatiquement par le systeme lors de la creation.
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? "Création..." : "Créer l'ambulancier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        show={pendingAction === "vehicle"}
        title="Assigner ce véhicule"
        description={`Ce véhicule sera assigné à ${selected?.userFirstName} ${selected?.userLastName}.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAssignVehicle}
      />

      <AdminConfirmModal
        show={pendingAction === "unassign"}
        title="Retirer le véhicule"
        description={`Le véhicule actuellement assigné à ${selected?.userFirstName} ${selected?.userLastName} sera retiré.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmUnassignVehicle}
      />
    </div>
  );
}