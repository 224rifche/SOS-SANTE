import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { citizenService } from "../../services/citizenService";

const profileSchema = z.object({
  address: z.string().optional(),
  bloodGroup: z.string().regex(/^(A|B|AB|O)[+-]$/, "Format invalide").optional().or(z.literal("")),
  emergencyContact: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro invalide").optional().or(z.literal("")),
  preferredLanguage: z.string().optional(),
});

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export default function CitizenProfilePage() {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
  });
  const isAdmin = hasRole("ADMIN");

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    citizenService.getMyProfile()
      .then((data) => reset({
        address: data.address || "",
        bloodGroup: data.bloodGroup || "",
        emergencyContact: data.emergencyContact || "",
        preferredLanguage: data.preferredLanguage || "fr",
      }))
      .catch(() => toast.error("Impossible de charger votre profil."))
      .finally(() => setLoading(false));
  }, [reset, isAdmin]);

  const onSubmit = async (formData) => {
    try {
      await citizenService.updateMyProfile({
        address: formData.address || null,
        bloodGroup: formData.bloodGroup || null,
        emergencyContact: formData.emergencyContact || null,
        preferredLanguage: formData.preferredLanguage || null,
      });
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <div className="text-center py-5">Chargement...</div>;

  if (isAdmin) {
    return (
      <>
        <h1 className="cit-page-title">Mon profil médical</h1>
        <div className="alert alert-info mx-3 rounded-4">
          <h5 className="alert-heading">Vue Administrateur</h5>
          <p className="mb-0">Le profil citoyen n'est pas disponible en mode administrateur.</p>
          <p className="mb-0 small text-muted">Utilisez la gestion des utilisateurs dans le tableau de bord admin.</p>
          <Link to="/admin" className="btn btn-sm btn-primary mt-2 rounded-3">
            Aller au tableau de bord Admin
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Link to="/citizen" className="cit-back-link">← Retour à l'accueil</Link>
      <h1 className="cit-page-title">Mon profil médical</h1>
      <p className="cit-page-sub">Ces informations sont transmises aux secours en cas d'urgence.</p>

      <div className="cit-card shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="cit-form-label" htmlFor="address">Adresse</label>
          <input id="address" className="cit-form-input" placeholder="Quartier, rue..." {...register("address")} />

          <label className="cit-form-label" htmlFor="bloodGroup">Groupe sanguin</label>
          <select id="bloodGroup" className="cit-form-select" {...register("bloodGroup")}>
            <option value="">Non renseigné</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.bloodGroup && <p className="text-danger small">{errors.bloodGroup.message}</p>}

          <label className="cit-form-label" htmlFor="emergencyContact">Contact d'urgence</label>
          <input id="emergencyContact" type="tel" className="cit-form-input" placeholder="+223..." {...register("emergencyContact")} />
          {errors.emergencyContact && <p className="text-danger small">{errors.emergencyContact.message}</p>}

          <label className="cit-form-label" htmlFor="lang">Langue</label>
          <select id="lang" className="cit-form-select" {...register("preferredLanguage")}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="bm">Bambara</option>
          </select>

          <button type="submit" className="cit-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </>
  );
}