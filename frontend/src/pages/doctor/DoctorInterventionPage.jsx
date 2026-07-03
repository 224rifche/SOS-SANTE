import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { interventionService } from "../../services/interventionService";
import { medicalNoteService } from "../../services/medicalNoteService";
import { statusLabel } from "../medical-center/regulationUtils";

export default function DoctorInterventionPage() {
  const { id } = useParams();
  const [intervention, setIntervention] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { diagnosis: "", observations: "" },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [interventionData, notesData] = await Promise.all([
          interventionService.getById(id),
          medicalNoteService.getByIntervention(id),
        ]);
        if (!cancelled) {
          setIntervention(interventionData);
          setNotes(notesData);
        }
      } catch {
        if (!cancelled) toast.error("Impossible de charger l'intervention.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const onSubmitNote = async (formData) => {
    setSaving(true);
    try {
      const note = await medicalNoteService.createNote({
        interventionId: id,
        diagnosis: formData.diagnosis,
        observations: formData.observations || null,
      });
      setNotes((prev) => [note, ...prev]);
      reset();
      toast.success("Note médicale enregistrée.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartCare = async () => {
    try {
      const updated = await interventionService.updateStatus(id, {
        newStatus: "PRISE_EN_CHARGE_MEDICALE_EN_COURS",
      });
      setIntervention(updated);
      toast.success("Prise en charge médicale démarrée.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transition impossible.");
    }
  };

  if (loading) {
    return <div className="text-center py-5">Chargement...</div>;
  }

  if (!intervention) {
    return (
      <div className="doc-card">
        <p>Intervention introuvable.</p>
        <Link to="/doctor/dashboard">Retour</Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/doctor/dashboard" className="text-secondary text-decoration-none small d-inline-block mb-3">
        ← Retour aux urgences
      </Link>

      <h1 className="doc-page-title">
        Dossier urgence #{String(intervention.id).substring(0, 8).toUpperCase()}
      </h1>

      <div className="doc-card mb-3">
        <p className="mb-1"><strong>Statut :</strong> {statusLabel(intervention.currentStatus)}</p>
        <p className="mb-1"><strong>Centre :</strong> {intervention.medicalCenterName || "—"}</p>
        <p className="mb-1"><strong>Ambulance :</strong> {intervention.ambulanceRegistrationNumber || "—"}</p>
        <p className="mb-0"><strong>Alerte :</strong> {intervention.alertId}</p>
      </div>

      {intervention.currentStatus === "MEDECIN_ASSIGNE" && (
        <button type="button" className="doc-btn w-100 mb-3" onClick={handleStartCare}>
          Démarrer la prise en charge médicale
        </button>
      )}

      <h2 className="h6 fw-bold mb-3">Notes médicales</h2>

      {notes.length > 0 && (
        <div className="mb-3">
          {notes.map((note) => (
            <div key={note.id} className="doc-card">
              <p className="fw-bold mb-1">{note.diagnosis}</p>
              {note.observations && <p className="small text-secondary mb-1">{note.observations}</p>}
              <p className="small text-muted mb-0">{note.doctorName} — {new Date(note.createdAt).toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}

      <div className="doc-card">
        <h3 className="h6 fw-bold mb-3">Nouvelle note</h3>
        <form onSubmit={handleSubmit(onSubmitNote)} noValidate>
          <label className="form-label small fw-semibold">Diagnostic *</label>
          <textarea
            className={`form-control mb-2 ${errors.diagnosis ? "is-invalid" : ""}`}
            rows={2}
            {...register("diagnosis", { required: "Diagnostic requis" })}
          />
          {errors.diagnosis && <div className="invalid-feedback mb-2">{errors.diagnosis.message}</div>}

          <label className="form-label small fw-semibold">Observations</label>
          <textarea className="form-control mb-3" rows={3} {...register("observations")} />

          <button type="submit" className="doc-btn w-100" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer la note"}
          </button>
        </form>
      </div>
    </>
  );
}
