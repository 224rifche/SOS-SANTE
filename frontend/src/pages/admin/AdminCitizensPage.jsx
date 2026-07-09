import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { citizenService } from "../../services/citizenService";
import { userService } from "../../services/userService";
import { alertService } from "../../services/alertService";
import AdminConfirmModal from "./AdminConfirmModal";

const PAGE_SIZE = 10;
const STATUS_LABELS = {
  ALERTE_CREEE: "Créée", EN_ATTENTE_VALIDATION: "En attente", VALIDEE: "Validée",
  REJETEE: "Rejetée", AMBULANCE_AFFECTEE: "Ambulance affectée", AMBULANCE_EN_ROUTE: "En route",
  ARRIVEE_SUR_LES_LIEUX: "Sur place", INTERVENTION_CLOTUREE: "Clôturée", ARCHIVEE: "Archivée",
};

export default function AdminCitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [pendingAction, setPendingAction] = useState(null); // "status"

  const load = () => {
    setLoading(true);
    Promise.all([
      citizenService.list({ size: 200 }),
      userService.listUsers({ role: "CITIZEN", size: 200 }),
    ])
      .then(([citizensRes, usersRes]) => {
        setCitizens(citizensRes.content || []);
        setUsers(usersRes.content || []);
      })
      .catch(() => toast.error("Impossible de charger la liste des citoyens."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Associe chaque profil citoyen a son compte utilisateur (email, statut, nom).
  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const enrichedCitizens = useMemo(() => {
    return citizens
      .map((c) => ({ ...c, userInfo: usersById.get(c.userId) }))
      .filter((c) => c.userInfo);
  }, [citizens, usersById]);

  const filtered = useMemo(() => {
    return enrichedCitizens.filter((c) => {
      const fullName = `${c.userInfo.firstName || ""} ${c.userInfo.lastName || ""}`.toLowerCase();
      return !search || fullName.includes(search.toLowerCase()) || c.userInfo.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [enrichedCitizens, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  const openDetail = async (citizen) => {
    setSelectedCitizen(citizen);
    setSelectedUser(citizen.userInfo);
    setAlertHistory([]);
    setHistoryLoading(true);
    try {
      const allAlerts = await alertService.listAll();
      const citizenAlerts = allAlerts
        .filter((a) => a.citizenId === citizen.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAlertHistory(citizenAlerts);
    } catch {
      toast.error("Impossible de charger l'historique des alertes.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const confirmToggleStatus = async (reason) => {
    try {
      await userService.updateUserStatus(selectedUser.id, !selectedUser.enabled);
      toast.success(`Statut du compte modifié par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedCitizen(null);
      load();
    } catch {
      toast.error("Échec de la mise à jour du statut.");
      setPendingAction(null);
    }
  };

  const activeCount = enrichedCitizens.filter((c) => c.userInfo.enabled).length;

  if (loading) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner">
        🛡️ Vue de supervision des citoyens. La création de compte se fait via l'onglet Utilisateurs (rôle Citoyen).
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total citoyens</div>
          <div className="admin-kpi-value">{enrichedCitizens.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Comptes actifs</div>
          <div className="admin-kpi-value">{activeCount}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Résultats filtrés</div>
          <div className="admin-kpi-value">{filtered.length}</div>
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className={selectedCitizen ? "col-lg-7" : "col-12"}>
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>Liste des citoyens</span>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: "220px" }}
                placeholder="Rechercher nom, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Groupe sanguin</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openDetail(c)}
                      style={{ cursor: "pointer", background: selectedCitizen?.id === c.id ? "#f8f9fa" : "transparent" }}
                    >
                      <td>{c.userInfo.firstName} {c.userInfo.lastName}</td>
                      <td className="small text-secondary">{c.userInfo.email}</td>
                      <td className="small text-secondary">{c.bloodGroup || "—"}</td>
                      <td><span className={`badge ${c.userInfo.enabled ? "bg-success" : "bg-secondary"}`}>{c.userInfo.enabled ? "Actif" : "Désactivé"}</span></td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-secondary py-4">Aucun citoyen ne correspond.</td></tr>
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

        {selectedCitizen && (
          <div className="col-lg-5">
            <div className="admin-panel">
              <div className="admin-panel-header d-flex justify-content-between align-items-center">
                <span>Fiche citoyen</span>
                <button type="button" className="btn-close" onClick={() => setSelectedCitizen(null)} />
              </div>
              <div className="p-3">
                <h6 className="fw-bold mb-1">{selectedUser?.firstName} {selectedUser?.lastName}</h6>
                <p className="small text-secondary mb-3">{selectedUser?.email}</p>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small text-secondary">Téléphone</div>
                    <div className="fw-semibold small">{selectedUser?.phone || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Groupe sanguin</div>
                    <div className="fw-semibold small">{selectedCitizen.bloodGroup || "Inconnu"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Adresse</div>
                    <div className="fw-semibold small">{selectedCitizen.address || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Contact d'urgence</div>
                    <div className="fw-semibold small">{selectedCitizen.emergencyContact || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Langue préférée</div>
                    <div className="fw-semibold small">{selectedCitizen.preferredLanguage || "—"}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-secondary fw-semibold mb-2">Historique des alertes</div>
                  {historyLoading && <p className="small text-secondary mb-0">Chargement...</p>}
                  {!historyLoading && alertHistory.length === 0 && (
                    <p className="small text-secondary mb-0">Aucune alerte enregistrée pour ce citoyen.</p>
                  )}
                  {!historyLoading && alertHistory.length > 0 && (
                    <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {alertHistory.map((alert) => (
                        <div key={alert.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                          <div>
                            <div className="small fw-semibold">{alert.categoryName}</div>
                            <div className="small text-secondary">{new Date(alert.createdAt).toLocaleDateString("fr-FR")}</div>
                          </div>
                          <span className="badge bg-secondary bg-opacity-25 text-dark">
                            {STATUS_LABELS[alert.status] || alert.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-intervention-zone">
                  <div className="admin-intervention-label">🛡️ Zone d'intervention administrative</div>
                  <button
                    type="button"
                    className={`btn btn-sm w-100 ${selectedUser?.enabled ? "btn-outline-secondary" : "btn-outline-success"}`}
                    onClick={() => setPendingAction("status")}
                  >
                    {selectedUser?.enabled ? "Désactiver ce compte" : "Activer ce compte"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminConfirmModal
        show={pendingAction === "status"}
        title={selectedUser?.enabled ? "Désactiver ce compte" : "Activer ce compte"}
        description={`Cette action va changer le statut du compte de ${selectedUser?.firstName} ${selectedUser?.lastName}.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmToggleStatus}
      />
    </div>
  );
}