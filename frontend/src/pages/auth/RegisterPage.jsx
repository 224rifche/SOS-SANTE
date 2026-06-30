import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const registerSchema = z.object({
  firstName: z.string().min(1, "Prenom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Au moins 8 caracteres"),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Compte cree avec succes");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la creation du compte.");
    }
  };

  return (
    <div className="auth-page">
      <h1>Creer un compte - Won-Mally</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>Prenom<input {...register("firstName")} />{errors.firstName && <span className="field-error">{errors.firstName.message}</span>}</label>
        <label>Nom<input {...register("lastName")} />{errors.lastName && <span className="field-error">{errors.lastName.message}</span>}</label>
        <label>Email<input type="email" {...register("email")} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
        <label>Telephone<input {...register("phone")} /></label>
        <label>Mot de passe<input type="password" {...register("password")} />{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creation..." : "Creer mon compte"}</button>
      </form>
      <p>Deja un compte ? <Link to="/login">Se connecter</Link></p>
    </div>
  );
}
