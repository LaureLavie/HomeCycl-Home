"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", mot_passe: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser(form.email, form.mot_passe);
      router.push(result.redirect || "/");
      router.refresh(); // force le middleware à relire le nouveau cookie
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-hero-content">
          <h1>HomeCycl’Home</h1>
          <h2>L’Artisan du Vélo Lyonnais à votre porte.</h2>
          <p>
            Simplifiez l’entretien de votre vélo avec un service de qualité,
            local et passionné. Nous nous déplaçons chez vous.
          </p>
          <span className="hero-badge">ENTRETIEN VÉLO GARANTI</span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-card">
          <h3>Bon retour.</h3>
          <p className="subtitle">Accédez à votre garage virtuel et vos rendez-vous.</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="nom@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Mot de passe</label>
            <input
              type="password"
              name="mot_passe"
              placeholder="••••••••"
              value={form.mot_passe}
              onChange={handleChange}
              required
            />

            <a className="forgot-link" href="#">Oublié ?</a>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="divider">ou</div>
          <a href="/signup" className="btn-secondary create-account">Créer un compte client</a>
        </div>

        <footer className="login-footer">
          <a href="/help">Aide</a>
          <a href="/legal">Mentions légales</a>
          <a href="/contact">Contact</a>
        </footer>
      </section>
    </main>
  );
}