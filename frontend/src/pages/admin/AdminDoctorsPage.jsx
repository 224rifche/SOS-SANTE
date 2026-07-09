import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { userService } from "../../services/userService";
import { medicalCenterService } from "../../services/medicalCenterService";
import { interventionService } from "../../services/interventionService";
import { medicalNoteService } from "../../services/medicalNoteService";
import AdminConfirmModal from "./AdminConfirmModal";

const PAGE_SIZE = 6;
const EMPTY_CREATE_FORM = { userId: "", medicalCenterId: "", specialty: "", licenseNumber: "" };
const STATUS_OPTIONS = ["OFF_DUTY", "ON_DUTY", "IN_CONSULTATION", "BREAK"];
const STATUS_LABELS = {
  OFF_DUTY: "Hors service", ON_DUTY: "En service", IN_CONSULTATION: "En consultation", BREAK: "En pause",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [page, setPage] = useState(0);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [statusOverride, setStatusOverride] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [pendingAction, setPendingAction] = useState(null); // "availability" | "status" | "delete"

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = () => {
    setLoading(true);
    doctorService.list({ size: 200 })
      .then((data) => setDoctors(data.content || []))
      .catch(() => toast.error("Impossible de charger la liste des médecins."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const centers = useMemo(() => {
    const names = new Set(doctors.map((d) => d.medicalCenterName).filter(Boolean));
    return Array.from(names).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const fullName = `${doc.userFirstName || ""} ${doc.userLastName || ""}`.toLowerCase();
      const matchesSearch = !search || fullName.includes(search.toLowerCase()) || (doc.specialty || "").toLowerCase().includes(search.toLowerCase());
      const matchesCenter = !centerFilter || doc.medicalCenterName === centerFilter;
      const matchesAvailability =
        !availabilityFilter ||
        (availabilityFilter === "available" && doc.available) ||
        (availabilityFilter === "unavailable" && !doc.available);
      return matchesSearch && matchesCenter && matchesAvailability;
    });
  }, [doctors, search, centerFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search, centerFilter, availabilityFilter]);

  const openDetail = async (doctor) => {
    setSelectedDoctor(doctor);
    setStatusOverride(doctor.status || "");
    setHistory([]);
    setHistoryLoading(true);
    try {
      const interventionsRes = await interventionService.list({ size: 200 });
      const doctorInterventions = (interventionsRes.content || [])
        .filter((i) => i.doctorId === doctor.id)
        .sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));

      const withNoteFlags = await Promise.all(
        doctorInterventions.map(async (item) => {
          try {
            const notes = await medicalNoteService.getByIntervention(item.id);
            return { ...item, hasNote: (notes || []).length > 0 };
          } catch {
            return { ...item, hasNote: false };
          }
        })
      );
      setHistory(withNoteFlags);
    } catch {
      toast.error("Impossible de charger l'historique des interventions.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const confirmAvailability = async (reason) => {
    try {
      await doctorService.updateAvailability(selectedDoctor.id, !selectedDoctor.available);
      toast.success(`Disponibilité modifiée par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedDoctor(null);
      load();
    } catch {
      toast.error("Échec de la mise à jour.");
    }
  };

  const confirmStatus = async (reason) => {
    if (statusOverride === selectedDoctor.status) {
      toast.info("Ce médecin a déjà ce statut.");
      setPendingAction(null);
      return;
    }
    try {
      await doctorService.updateStatus(selectedDoctor.id, statusOverride);
      toast.success(`Statut forcé par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedDoctor(null);
      load();
    } catch {
      toast.error("Échec de la mise à jour du statut.");
    }
  };

  const confirmDelete = async (reason) => {
    try {
      await doctorService.remove(selectedDoctor.id);
      toast.success(`Médecin supprimé définitivement par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedDoctor(null);
      load();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(err.response?.data?.message || "Impossible de supprimer : ressources rattachées. Utilisez la désactivation à la place.");
      } else {
        toast.error("Échec de la suppression.");
      }
      setPendingAction(null);
    }
  };

  const openCreateModal = async () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setShowCreateModal(true);
    try {
      const [usersRes, centersRes] = await Promise.all([
        userService.listUsers({ role: "DOCTOR", size: 200 }),
        medicalCenterService.list({ size: 200 }),
      ]);
      const alreadyLinkedIds = new Set(doctors.map((d) => d.userId));
      const eligible = (usersRes.content || []).filter((u) => !alreadyLinkedIds.has(u.id));
      setEligibleUsers(eligible);
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
      await doctorService.create(createForm);
      toast.success("Médecin créé avec succès.");
      setShowCreateModal(false);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Impossible de créer ce médecin.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (loading) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner d-flex justify-content-between align-items-center">
        <span>🛡️ Vue de supervision des médecins. Intervention possible en cas de compte bloqué, avec motif obligatoire.</span>
        <button type="button" className="btn btn-sm btn-primary" onClick={openCreateModal}>
          + Nouveau médecin
        </button>
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total médecins</div>
          <div className="admin-kpi-value">{doctors.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Disponibles</div>
          <div className="admin-kpi-value">{doctors.filter((d) => d.available).length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Centres médicaux</div>
          <div className="admin-kpi-value">{centers.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Résultats filtrés</div>
          <div className="admin-kpi-value">{filtered.length}</div>
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className={selectedDoctor ? "col-lg-7" : "col-12"}>
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>Liste des médecins</span>
              <div className="d-flex flex-wrap gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "200px" }}
                  placeholder="Rechercher nom, spécialité..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  style={{ width: "180px" }}
                  value={centerFilter}
                  onChange={(e) => setCenterFilter(e.target.value)}
                >
                  <option value="">Tous les centres</option>
                  {centers.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "150px" }}
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">Toute disponibilité</option>
                  <option value="available">Disponible</option>
                  <option value="unavailable">Indisponible</option>
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Spécialité</th>
                    <th>Centre médical</th>
                    <th>Statut</th>
                    <th>Disponibilité</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => openDetail(doc)}
                      style={{ cursor: "pointer", background: selectedDoctor?.id === doc.id ? "#f8f9fa" : "transparent" }}
                    >
                      <td>Dr. {doc.userFirstName} {doc.userLastName}</td>
                      <td className="small text-secondary">{doc.specialty || "—"}</td>
                      <td className="small text-secondary">{doc.medicalCenterName}</td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-dark">{STATUS_LABELS[doc.status] || doc.status}</span></td>
                      <td><span className={`badge ${doc.available ? "bg-success" : "bg-secondary"}`}>{doc.available ? "Disponible" : "Indisponible"}</span></td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-secondary py-4">Aucun médecin ne correspond aux filtres.</td></tr>
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

        {selectedDoctor && (
          <div className="col-lg-5">
            <div className="admin-panel">
              <div className="admin-panel-header d-flex justify-content-between align-items-center">
                <span>Fiche médecin</span>
                <button type="button" className="btn-close" onClick={() => setSelectedDoctor(null)} />
              </div>
              <div className="p-3">
                <h6 className="fw-bold mb-1">Dr. {selectedDoctor.userFirstName} {selectedDoctor.userLastName}</h6>
                <p className="small text-secondary mb-3">{selectedDoctor.userEmail || "Email non renseigné"}</p>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small text-secondary">Spécialité</div>
                    <div className="fw-semibold small">{selectedDoctor.specialty || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">N° de licence</div>
                    <div className="fw-semibold small">{selectedDoctor.licenseNumber || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Centre médical</div>
                    <div className="fw-semibold small">{selectedDoctor.medicalCenterName}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Statut actuel</div>
                    <div className="fw-semibold small">{STATUS_LABELS[selectedDoctor.status] || selectedDoctor.status}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-secondary fw-semibold mb-2">Historique des interventions</div>
                  {historyLoading && <p className="small text-secondary mb-0">Chargement...</p>}
                  {!historyLoading && history.length === 0 && (
                    <p className="small text-secondary mb-0">Aucune intervention enregistrée pour ce médecin.</p>
                  )}
                  {!historyLoading && history.length > 0 && (
                    <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                      {history.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                          <div>
                            <div className="small fw-semibold">
                              {item.startedAt ? new Date(item.startedAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                            </div>
                            <div className="small text-secondary">{item.currentStatus}</div>
                          </div>
                          {item.hasNote && (
                            <span className="badge bg-info bg-opacity-25 text-dark">Note rédigée</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="small text-secondary fst-italic mt-2 mb-0">
                    Le contenu clinique des notes reste confidentiel et n'est pas accessible depuis l'administration.
                  </p>
                </div>

                <div className="admin-intervention-zone">
                  <div className="admin-intervention-label">🛡️ Zone d'intervention administrative</div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Forcer le statut clinique</label>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={statusOverride}
                        onChange={(e) => setStatusOverride(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning text-nowrap"
                        onClick={() => setPendingAction("status")}
                      >
                        Forcer
                      </button>
                    </div>
                    <div className="form-text">
                      Utile si le statut reste bloqué suite à une déconnexion.
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100 mb-2"
                    onClick={() => setPendingAction("availability")}
                  >
                    {selectedDoctor.available ? "Forcer indisponible" : "Forcer disponible"}
                  </button>

                  <hr className="my-2" />

                  <button
                    type="button"
                    className="btn btn-sm btn-danger w-100"
                    onClick={() => setPendingAction("delete")}
                  >
                    🗑 Supprimer définitivement
                  </button>
                  <div className="form-text">
                    Refusé automatiquement si des interventions ou notes médicales sont rattachées à ce médecin.
                  </div>
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
                  <h5 className="modal-title">Nouveau médecin</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}

                  <div className="mb-2">
                    <label className="form-label small">Compte utilisateur (rôle Médecin)</label>
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
                        Aucun utilisateur disponible. Créez d'abord un compte avec le rôle DOCTOR dans l'onglet Utilisateurs.
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
                    <label className="form-label small">Spécialité</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={createForm.specialty}
                      onChange={(e) => setCreateForm({ ...createForm, specialty: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Numéro de licence</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={createForm.licenseNumber}
                      onChange={(e) => setCreateForm({ ...createForm, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? "Création..." : "Créer le médecin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        show={pendingAction === "availability"}
        title={selectedDoctor?.available ? "Forcer indisponible" : "Forcer disponible"}
        description={`Cette action va changer la disponibilité du Dr. ${selectedDoctor?.userFirstName} ${selectedDoctor?.userLastName}.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAvailability}
      />

      <AdminConfirmModal
        show={pendingAction === "status"}
        title="Forcer le statut clinique"
        description={`Le statut du Dr. ${selectedDoctor?.userFirstName} ${selectedDoctor?.userLastName} sera forcé sur "${STATUS_LABELS[statusOverride]}".`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmStatus}
      />

      <AdminConfirmModal
        show={pendingAction === "delete"}
        title="Supprimer définitivement"
        description={`Vous êtes sur le point de supprimer définitivement le Dr. ${selectedDoctor?.userFirstName} ${selectedDoctor?.userLastName}. Cette action est bloquée automatiquement si des interventions ou notes médicales existent.`}
        dangerous
        confirmLabel="Supprimer définitivement"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}