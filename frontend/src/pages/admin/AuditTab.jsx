import { useEffect, useMemo, useState } from "react";
import { auditService } from "../../services/auditService";

const FILTER_DEBOUNCE_MS = 400;

export default function AuditTab() {
  const [page, setPage] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionInput, setActionInput] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(0);
      setAction(actionInput);
    }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [actionInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditService.listLogs({
      page: pageNumber,
      action: action || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((data) => { if (!cancelled) setPage(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || "Impossible de charger le journal d'audit."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageNumber, action, dateFrom, dateTo]);

  const handleReset = () => {
    setActionInput("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    setUserFilter("");
    setPageNumber(0);
  };

  const filteredByUser = useMemo(() => {
    if (!page) return [];
    if (!userFilter.trim()) return page.content;
    return page.content.filter((log) =>
      (log.userEmail || "").toLowerCase().includes(userFilter.toLowerCase())
    );
  }, [page, userFilter]);

  const kpis = useMemo(() => {
    if (!page) return { total: 0, today: 0, anonymous: 0 };
    const todayStr = new Date().toDateString();
    return {
      total: page.totalElements || 0,
      today: page.content.filter((log) => new Date(log.createdAt).toDateString() === todayStr).length,
      anonymous: page.content.filter((log) => !log.userEmail).length,
    };
  }, [page]);

  return (
    <div>
      <div className="admin-supervision-banner">
        📜 Journal d'audit en lecture seule. Toutes les actions administratives et systeme y sont enregistrées de manière permanente.
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total entrées</div>
          <div className="admin-kpi-value">{kpis.total}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Aujourd'hui (page actuelle)</div>
          <div className="admin-kpi-value">{kpis.today}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Anonymes (page actuelle)</div>
          <div className="admin-kpi-value">{kpis.anonymous}</div>
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className={selectedLog ? "col-lg-8" : "col-12"}>
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>Entrées du journal</span>
              <div className="d-flex flex-wrap gap-2 align-items-end">
                <div>
                  <label className="form-label small mb-1 d-block">Action</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ width: "140px" }}
                    placeholder="ex: LOGIN..."
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label small mb-1 d-block">Utilisateur</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ width: "160px" }}
                    placeholder="email..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label small mb-1 d-block">Du</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateFrom}
                    onChange={(e) => { setPageNumber(0); setDateFrom(e.target.value); }}
                  />
                </div>
                <div>
                  <label className="form-label small mb-1 d-block">Au</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateTo}
                    onChange={(e) => { setPageNumber(0); setDateTo(e.target.value); }}
                  />
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
                  Réinitialiser
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger m-3">{error}</div>}
            {loading && <p className="text-secondary text-center py-3 mb-0">Chargement...</p>}

            {!loading && page && (
              <>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Utilisateur</th>
                        <th>Action</th>
                        <th>Entité</th>
                        <th>IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredByUser.map((log) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          style={{ cursor: "pointer", background: selectedLog?.id === log.id ? "#f8f9fa" : "transparent" }}
                        >
                          <td className="small text-secondary">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                          <td className="small">{log.userEmail || <em className="text-secondary">Anonyme</em>}</td>
                          <td>
                            <span className="badge bg-secondary bg-opacity-25 text-dark">{log.action}</span>
                          </td>
                          <td className="small text-secondary">{log.entityName}</td>
                          <td className="small text-secondary">{log.ipAddress || "—"}</td>
                        </tr>
                      ))}
                      {filteredByUser.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-secondary py-4">Aucun log d'audit trouvé.</td></tr>
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

        {selectedLog && (
          <div className="col-lg-4">
            <div className="admin-panel">
              <div className="admin-panel-header d-flex justify-content-between align-items-center">
                <span>Détail de l'entrée</span>
                <button type="button" className="btn-close" onClick={() => setSelectedLog(null)} />
              </div>
              <div className="p-3">
                <div className="mb-2">
                  <div className="small text-secondary">Date et heure</div>
                  <div className="fw-semibold small">{new Date(selectedLog.createdAt).toLocaleString("fr-FR")}</div>
                </div>
                <div className="mb-2">
                  <div className="small text-secondary">Utilisateur</div>
                  <div className="fw-semibold small">{selectedLog.userEmail || "Anonyme"}</div>
                </div>
                <div className="mb-2">
                  <div className="small text-secondary">Action</div>
                  <div className="fw-semibold small">
                    <span className="badge bg-secondary bg-opacity-25 text-dark">{selectedLog.action}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="small text-secondary">Entité concernée</div>
                  <div className="fw-semibold small">{selectedLog.entityName || "—"}</div>
                </div>
                <div className="mb-2">
                  <div className="small text-secondary">ID de l'entité</div>
                  <div className="fw-semibold small text-break">{selectedLog.entityId || "—"}</div>
                </div>
                <div className="mb-2">
                  <div className="small text-secondary">Adresse IP</div>
                  <div className="fw-semibold small">{selectedLog.ipAddress || "—"}</div>
                </div>
                <div className="mb-0">
                  <div className="small text-secondary">ID utilisateur</div>
                  <div className="fw-semibold small text-break">{selectedLog.userId || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}