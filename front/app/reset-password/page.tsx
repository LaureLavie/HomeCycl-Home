"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/authService";

// AUTH-10 : Réinitialisation du mot de passe (lien reçu par email)
// Compétence CDA : Développer des composants métier — Sécurité applicative
//
// useSearchParams() nécessite une frontière <Suspense> côté App Router :
// on isole donc la logique dans un composant enfant.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ mot_passe: "", confirmation: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien de réinitialisation invalide. Refaites une demande.");
      return;
    }
    if (form.mot_passe !== form.confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.mot_passe);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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
          <h2>Choisissez un nouveau mot de passe.</h2>
          <p>Ce lien est valable une heure et à usage unique.</p>
          <span className="hero-badge">ENTRETIEN VELO GARANTI</span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-card">
          <h3>Nouveau mot de passe</h3>
          <p className="subtitle">Saisissez et confirmez votre nouveau mot de passe.</p>

          {!token && (
            <p className="error-message">
              Lien invalide ou incomplet. Merci de refaire une demande depuis
              la page « mot de passe oublié ».
            </p>
          )}

          {error && <p className="error-message">{error}</p>}

          {success ? (
            <p className="success-message">
              Mot de passe réinitialisé avec succès. Redirection vers la
              connexion…
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                name="mot_passe"
                placeholder="••••••••"
                value={form.mot_passe}
                onChange={handleChange}
                required
                disabled={!token}
              />
              <p className="form-hint">
                8 caractères minimum, une majuscule, une minuscule et un chiffre.
              </p>

              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmation"
                placeholder="••••••••"
                value={form.confirmation}
                onChange={handleChange}
                required
                disabled={!token}
              />

              <button
                className="btn-primary"
                type="submit"
                disabled={loading || !token}
              >
                {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
              </button>
            </form>
          )}

          <div className="divider">ou</div>
          <a href="/login" className="btn-secondary create-account">
            Retour à la connexion
          </a>
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