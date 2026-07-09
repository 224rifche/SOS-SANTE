import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";

const STATUS_OPTIONS = ["OFF_DUTY", "ON_DUTY", "IN_CONSULTATION", "BREAK"];

const STATUS_TAG_CLASS = {
  ON_DUTY: "available",
  IN_CONSULTATION: "busy",
  BREAK: "offline",
  OFF_DUTY: "offline",
};

export default function RegulationDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    doctorService.list({ size: 100 })
      .then((data) => setDoctors(data.content || []))
      .catch(() => toast.error("Impossible de charger les médecins."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (doc, status) => {
    setBusyId(doc.id);
    try {
      await doctorService.updateStatus(doc.id, status);
      toast.success(`Dr. ${doc.userLastName} → ${status}`);
      load();
    } catch {
      toast.error("Échec du changement de statut.");
    } finally {
      setBusyId(null);
    }
  };

  const onlineCount = doctors.filter((d) => d.status === "ON_DUTY" || d.status === "IN_CONSULTATION").length;

  return (
    <>
      <h2 className="reg-page-title">Médecins</h2>
      <p className="reg-page-subtitle">{onlineCount} en ligne sur {doctors.length}</p>

      <div className="reg-panel">
        {loading ? (
          <div className="reg-loading">Chargement...</div>
        ) : doctors.length === 0 ? (
          <div className="reg-empty-state">Aucun médecin enregistré.</div>
        ) : (
          <div className="reg-table-responsive">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Spécialité</th>
                  <th>Centre médical</th>
                  <th>Statut</th>
                  <th>Changer le statut</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>Dr. {doc.userFirstName} {doc.userLastName}</td>
                    <td>{doc.specialty || "—"}</td>
                    <td>{doc.medicalCenterName || "—"}</td>
                    <td><span className={`reg-status-tag ${STATUS_TAG_CLASS[doc.status] || "offline"}`}>{doc.status}</span></td>
                    <td>
                      <select
                        className="reg-select"
                        value={doc.status}
                        disabled={busyId === doc.id}
                        onChange={(e) => handleStatusChange(doc, e.target.value)}
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
    </>
  );
}
