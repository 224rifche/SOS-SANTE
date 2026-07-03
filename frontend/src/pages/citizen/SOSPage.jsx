import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGeolocation } from "../../hooks/useGeolocation";
import { alertService } from "../../services/alertService";
import { emergencyCategoryService } from "../../services/emergencyCategoryService";

const alertSchema = z.object({
  categoryId: z.coerce.number().min(1, "Sélectionnez une catégorie"),
  description: z.string().optional(),
});

export default function SOSPage() {
  const { position, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(alertSchema),
  });

  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    requestLocation();
    emergencyCategoryService.getAllCategories()
      .then(setCategories)
      .catch(() => toast.error("Impossible de charger les catégories."))
      .finally(() => setCategoriesLoading(false));
  }, [requestLocation]);

  const onSubmit = async (formData) => {
    if (!position) {
      toast.error("Activez la géolocalisation avant d'envoyer l'alerte.");
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
      toast.success("Alerte envoyée. Les secours ont été notifiés.");
      navigate(`/citizen/alert/${alert.id}/confirmation`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #0b1524 0%, #12213a 40%, #f4f6f9 40%)", minHeight: "100vh", padding: "20px 16px 100px" }}>
      <Link to="/citizen" className="text-white text-decoration-none small d-inline-block mb-4">← Retour</Link>

      <div className="text-center text-white mb-4">
        <div className="cit-sos-btn-large mx-auto mb-3" style={{ width: "140px", height: "140px", cursor: "default" }}>
          <span style={{ fontSize: "1.6rem" }}>SOS</span>
          <span>URGENCE</span>
        </div>
        <h1 className="h5 fw-bold">Déclencher une urgence</h1>
        <p className="small opacity-75 mb-0">Votre position sera transmise au centre de régulation</p>
      </div>

      <div className="cit-card">
        {geoLoading && <p className="cit-card-sub">Localisation en cours...</p>}
        {geoError && <p className="text-danger small">{geoError}</p>}
        {position && (
          <p className="small text-success mb-3">
            ✓ GPS : {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="cit-section-label">Type d'urgence</p>
          {categoriesLoading ? (
            <p className="cit-card-sub">Chargement...</p>
          ) : (
            <div className="cit-grid-2 mb-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="cit-card mb-0"
                  style={{
                    cursor: "pointer",
                    borderColor: Number(selectedCategoryId) === cat.id ? "#e53935" : undefined,
                    background: Number(selectedCategoryId) === cat.id ? "rgba(229,57,53,0.06)" : undefined,
                  }}
                >
                  <input type="radio" value={cat.id} className="d-none" {...register("categoryId")} onChange={() => setValue("categoryId", cat.id, { shouldValidate: true })} />
                  <span className="cit-card-title" style={{ fontSize: "0.8rem" }}>{cat.name}</span>
                </label>
              ))}
            </div>
          )}
          {errors.categoryId && <p className="text-danger small">{errors.categoryId.message}</p>}

          <label className="cit-form-label">Description (optionnelle)</label>
          <textarea className="cit-form-textarea" rows={3} placeholder="Décrivez la situation..." {...register("description")} />

          <button type="submit" className="cit-btn-primary" disabled={submitting || !position || categoriesLoading}>
            {submitting ? "Envoi..." : "Envoyer le SOS maintenant"}
          </button>
        </form>
      </div>
    </div>
  );
}
