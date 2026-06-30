import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Connexion reussie");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="auth-page">
      <h1>Connexion - Won-Mally</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        <label>
          Mot de passe
          <input type="password" {...register("password")} />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p>Pas encore de compte ? <Link to="/register">Creer un compte</Link></p>
    </div>
  );
}
