import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { userService } from "../../services/userService";
import AdminConfirmModal from "./AdminConfirmModal";

const ROLE_OPTIONS = ["ADMIN", "CITIZEN", "MEDICAL_CENTER", "DOCTOR", "AMBULANCIER"];

const ROLE_BADGE_CLASSES = {
  ADMIN: "bg-danger bg-opacity-10 text-danger",
  CITIZEN: "bg-primary bg-opacity-10 text-primary",
  MEDICAL_CENTER: "bg-info bg-opacity-10 text-info",
  DOCTOR: "bg-success bg-opacity-10 text-success",
  AMBULANCIER: "bg-warning bg-opacity-10 text-warning",
};

const EMPTY_CREATE_FORM = {
  email: "", password: "", firstName: "", lastName: "", phone: "", roleNames: [],
};

const EMPTY_EDIT_FORM = {
  firstName: "", lastName: "", phone: "",
};

const SEARCH_DEBOUNCE_MS = 400;

export default function UsersTab() {
  const [page, setPage] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [roleOverride, setRoleOverride] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  const [pendingAction, setPendingAction] = useState(null); // "status" | "role" | "delete"

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(0);
      setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    userService.listUsers({ role: roleFilter || undefined, search: search || undefined, page: pageNumber })
      .then((data) => setPage(data))
      .catch((err) => setError(err.response?.data?.message || "Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, [roleFilter, search, pageNumber]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const kpis = useMemo(() => {
    if (!page) return { total: 0, active: 0, disabled: 0 };
    return {
      total: page.totalElements || 0,
      active: page.content.filter((u) => u.enabled).length,
      disabled: page.content.filter((u) => !u.enabled).length,
    };
  }, [page]);

  const openDetail = (user) => {
    setSelectedUser(user);
    setRoleOverride(user.roles[0] || "");
  };

  const confirmToggleStatus = async (reason) => {
    try {
      await userService.updateUserStatus(selectedUser.id, !selectedUser.enabled);
      toast.success(`Statut modifié par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de modifier le statut.");
      setPendingAction(null);
    }
  };

  const confirmChangeRole = async (reason) => {
    if (!roleOverride) return;
    try {
      await userService.updateUserRoles(selectedUser.id, [roleOverride]);
      toast.success(`Rôle modifié par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de modifier le rôle.");
      setPendingAction(null);
    }
  };

  const confirmDelete = async (reason) => {
    try {
      await userService.deleteUser(selectedUser.id);
      toast.success(`Utilisateur supprimé par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de supprimer cet utilisateur.");
      setPendingAction(null);
    }
  };

  const openCreateModal = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setShowCreateModal(true);
  };

  const toggleCreateRole = (role) => {
    setCreateForm((prev) => ({
      ...prev,
      roleNames: prev.roleNames.includes(role)
        ? prev.roleNames.filter((r) => r !== role)
        : [...prev.roleNames, role],
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await userService.createUser(createForm);
      toast.success("Utilisateur créé avec succès.");
      setShowCreateModal(false);
      loadUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Impossible de creer cet utilisateur.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    });
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError(null);
    try {
      await userService.updateUser(editingUser.id, editForm);
      toast.success("Informations mises à jour.");
      setEditingUser(null);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setEditError(err.response?.data?.message || "Impossible de modifier cet utilisateur.");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading && !page) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner d-flex justify-content-between align-items-center">
        <span>⚙️ Gestion des comptes utilisateurs. Toute modification de rôle ou de statut exige un motif obligatoire.</span>
        <button type="button" className="btn btn-sm btn-primary" onClick={openCreateModal}>
          + Nouvel utilisateur
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total utilisateurs</div>
          <div className="admin-kpi-value">{kpis.total}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Actifs (page actuelle)</div>
          <div className="admin-kpi-value">{kpis.active}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Désactivés (page actuelle)</div>
          <div className="admin-kpi-value">{kpis.disabled}</div>
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className={selectedUser ? "col-lg-7" : "col-12"}>
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>Liste des utilisateurs</span>
              <div className="d-flex flex-wrap gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "160px" }}
                  value={roleFilter}
                  onChange={(e) => { setPageNumber(0); setRoleFilter(e.target.value); }}
                >
                  <option value="">Tous les rôles</option>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "180px" }}
                  placeholder="Rechercher (email, nom...)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            {loading && <p className="text-secondary text-center py-3 mb-0">Chargement...</p>}

            {!loading && page && (
              <>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôles</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page.content.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => openDetail(user)}
                          style={{ cursor: "pointer", background: selectedUser?.id === user.id ? "#f8f9fa" : "transparent" }}
                        >
                          <td>{user.firstName} {user.lastName}</td>
                          <td className="small text-secondary">{user.email}</td>
                          <td>
                            {user.roles.map((r) => (
                              <span
                                key={r}
                                className={`badge me-1 ${ROLE_BADGE_CLASSES[r] || "bg-secondary bg-opacity-10 text-secondary"}`}
                              >
                                {r}
                              </span>
                            ))}
                          </td>
                          <td>
                            <span className={`badge ${user.enabled ? "bg-success" : "bg-secondary"}`}>
                              {user.enabled ? "Actif" : "Désactivé"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {page.content.length === 0 && (
                        <tr><td colSpan={4} className="text-center text-secondary py-4">Aucun utilisateur trouvé.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {page.content.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                    <span className="small text-secondary">
                      Page {page.number + 1} sur {page.totalPages || 1} ({page.totalElements} au total)
                    </span>
                    <div className="btn-group">
                      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page.first} onClick={() => setPageNumber((p) => p - 1)}>Précédent</button>
                      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page.last} onClick={() => setPageNumber((p) => p + 1)}>Suivant</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selectedUser && (
          <div className="col-lg-5">
            <div className="admin-panel">
              <div className="admin-panel-header d-flex justify-content-between align-items-center">
                <span>Fiche utilisateur</span>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)} />
              </div>
              <div className="p-3">
                <h6 className="fw-bold mb-1">{selectedUser.firstName} {selectedUser.lastName}</h6>
                <p className="small text-secondary mb-3">{selectedUser.email}</p>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small text-secondary">Téléphone</div>
                    <div className="fw-semibold small">{selectedUser.phone || "—"}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-secondary">Statut</div>
                    <div className="fw-semibold small">{selectedUser.enabled ? "Actif" : "Désactivé"}</div>
                  </div>
                  <div className="col-12">
                    <div className="small text-secondary mb-1">Rôles actuels</div>
                    {selectedUser.roles.map((r) => (
                      <span key={r} className={`badge me-1 ${ROLE_BADGE_CLASSES[r] || "bg-secondary bg-opacity-10 text-secondary"}`}>{r}</span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100 mb-2"
                  onClick={() => openEditModal(selectedUser)}
                >
                  Modifier les informations
                </button>

                <div className="admin-intervention-zone">
                  <div className="admin-intervention-label">🛡️ Zone d'intervention administrative</div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Changer le rôle</label>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={roleOverride}
                        onChange={(e) => setRoleOverride(e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning text-nowrap"
                        onClick={() => setPendingAction("role")}
                      >
                        Forcer
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm w-100 mb-2 ${selectedUser.enabled ? "btn-outline-secondary" : "btn-outline-success"}`}
                    onClick={() => setPendingAction("status")}
                  >
                    {selectedUser.enabled ? "Désactiver ce compte" : "Activer ce compte"}
                  </button>

                  <hr className="my-2" />

                  <button
                    type="button"
                    className="btn btn-sm btn-danger w-100"
                    onClick={() => setPendingAction("delete")}
                  >
                    🗑 Supprimer définitivement
                  </button>
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
                  <h5 className="modal-title">Nouvel utilisateur</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}

                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small">Prenom</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                    <div className="form-text">8 caracteres min., majuscule, minuscule, chiffre et caractere special (@$!%*?&amp;).</div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Telephone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+224..."
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small d-block">Roles</label>
                    {ROLE_OPTIONS.map((role) => (
                      <div className="form-check form-check-inline" key={role}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`role-${role}`}
                          checked={createForm.roleNames.includes(role)}
                          onChange={() => toggleCreateRole(role)}
                        />
                        <label className="form-check-label small" htmlFor={`role-${role}`}>{role}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? "Creation..." : "Creer l'utilisateur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setEditingUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Modifier {editingUser.email}</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingUser(null)} />
                </div>
                <div className="modal-body">
                  {editError && <div className="alert alert-danger py-2">{editError}</div>}

                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small">Prenom</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small">Telephone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+224..."
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingUser(null)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                    {editSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        show={pendingAction === "status"}
        title={selectedUser?.enabled ? "Désactiver ce compte" : "Activer ce compte"}
        description={`Cette action va changer le statut du compte de ${selectedUser?.firstName} ${selectedUser?.lastName}.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmToggleStatus}
      />

      <AdminConfirmModal
        show={pendingAction === "role"}
        title="Forcer le rôle"
        description={`Le rôle de ${selectedUser?.firstName} ${selectedUser?.lastName} sera forcé sur "${roleOverride}".`}
        dangerous
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmChangeRole}
      />

      <AdminConfirmModal
        show={pendingAction === "delete"}
        title="Supprimer cet utilisateur"
        description={selectedUser ? `Vous êtes sur le point de supprimer définitivement le compte de ${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email}). Cette action est irréversible.` : ""}
        dangerous
        confirmLabel="Supprimer définitivement"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}