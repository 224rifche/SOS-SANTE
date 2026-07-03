import { useEffect, useState } from "react";
import { auditService } from "../../services/auditService";

export default function AuditTab() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    auditService.listLogs()
      .then((data) => { if (!cancelled) setPage(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || "Impossible de charger le journal d'audit."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-secondary">Chargement...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!page) return null;

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Date</th>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Entite</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {page.content.map((log) => (
            <tr key={log.id}>
              <td className="small text-secondary">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
              <td className="small">{log.userEmail || <em className="text-secondary">Anonyme</em>}</td>
              <td>
                <span className="badge bg-secondary bg-opacity-25 text-dark">{log.action}</span>
              </td>
              <td className="small text-secondary">{log.entityName}</td>
              <td className="small text-secondary">{log.ipAddress || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {page.content.length === 0 && (
        <p className="text-secondary text-center py-4">Aucun log d'audit trouve.</p>
      )}
    </div>
  );
}