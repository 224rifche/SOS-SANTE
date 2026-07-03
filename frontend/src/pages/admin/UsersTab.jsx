import { useEffect, useState, useCallback } from "react";
import { userService } from "../../services/userService";

const ROLE_OPTIONS = ["ADMIN", "CITIZEN", "MEDICAL_CENTER", "DOCTOR", "AMBULANCIER"];

export default function UsersTab() {
  const [page, setPage] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    userService.listUsers({ role: roleFilter || undefined, search: search || undefined })
      .then((data) => setPage(data))
      .catch((err) => setError(err.response?.data?.message || "Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, [roleFilter, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user) => {
    setActionError(null);
    try {
      await userService.updateUserStatus(user.id, !user.enabled);
      loadUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de modifier le statut.");
    }
  };

  const handleChangeRole = async (user, newRole) => {
    setActionError(null);
    try {
      await userService.updateUserRoles(user.id, [newRole]);
      loadUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de modifier le role.");
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select w-auto"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tous les roles</option>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Rechercher (email, nom...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {actionError && <div className="alert alert-danger py-2">{actionError}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-secondary">Chargement...</p>}

      {!loading && page && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {page.content.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td className="small text-secondary">{user.email}</td>
                  <td>
                    {user.roles.map((r) => (
                      <span key={r} className="badge bg-primary bg-opacity-10 text-primary me-1">{r}</span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${user.enabled ? "bg-success" : "bg-secondary"}`}>
                      {user.enabled ? "Actif" : "Desactive"}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <select
                        className="form-select form-select-sm w-auto"
                        value=""
                        onChange={(e) => { if (e.target.value) handleChangeRole(user, e.target.value); }}
                      >
                        <option value="">Changer role...</option>
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        type="button"
                        className={`btn btn-sm ${user.enabled ? "btn-outline-danger" : "btn-outline-success"}`}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.enabled ? "Desactiver" : "Activer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {page.content.length === 0 && (
            <p className="text-secondary text-center py-4">Aucun utilisateur trouve.</p>
          )}
        </div>
      )}
    </div>
  );
}