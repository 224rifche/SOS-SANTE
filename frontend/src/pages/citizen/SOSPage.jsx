import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import SOSButton from "../../components/business/SOSButton";
import { useGeolocation } from "../../hooks/useGeolocation";
import { alertService } from "../../services/alertService";
import { useNavigate } from "react-router-dom";

const alertSchema = z.object({
  categoryId: z.coerce.number().min(1, "Veuillez selectionner une categorie"),
  description: z.string().optional(),
});

// NOTE : en V1, la liste des categories sera chargee depuis GET /api/v1/emergency-categories.
const CATEGORIES_PLACEHOLDER = [
  { id: 1, name: "Accident de la route" },
  { id: 2, name: "Malaise / Perte de connaissance" },
  { id: 3, name: "Accouchement" },
  { id: 4, name: "Blessure grave / Hemorragie" },
];

export default function SOSPage() {
  const { position, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(alertSchema),
  });

  const onSubmit = async (formData) => {
    if (!position) {
      toast.error("Position GPS requise. Veuillez l'activer avant d'envoyer l'alerte.");
      return;
    }
    setSubmitting(true);
    try {
      const alert = await alertService.createAlert({
        categoryId: formData.categoryId,
        latitude: position.latitude,
        longitude: position.longitude,
        description: formData.description,
      });
      toast.success("Alerte envoyee. Les secours ont ete notifies.");
      navigate(`/citizen/tracking/${alert.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'alerte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sos-page">
      <h1>Declencher une urgence</h1>

      <SOSButton disabled={submitting} onTrigger={() => { requestLocation(); }} />

      {geoLoading && <p>Recuperation de votre position...</p>}
      {geoError && <p className="field-error">{geoError}</p>}
      {position && <p>Position detectee ({position.latitude.toFixed(5)}, {position.longitude.toFixed(5)})</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          Categorie de l'urgence
          <select {...register("categoryId")} defaultValue="">
            <option value="" disabled>Selectionner...</option>
            {CATEGORIES_PLACEHOLDER.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="field-error">{errors.categoryId.message}</span>}
        </label>

        <label>
          Description (optionnelle)
          <textarea {...register("description")} rows={3} />
        </label>

        <button type="submit" disabled={submitting || !position}>
          {submitting ? "Envoi en cours..." : "Confirmer et transmettre l'alerte"}
        </button>
      </form>
    </div>
  );
}
