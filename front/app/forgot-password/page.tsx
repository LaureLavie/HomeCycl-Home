"use client";

import { useState } from "react";
import { forgotPassword } from "@/services/authService";

// AUTH-09 : Mot de passe oublié
// Compétence CDA : Développer des composants métier — Sécurité applicative
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState(null); // visible seulement en dev (pas de service email branché)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      setSent(true);
      if (result.devResetLink) setDevLink(result.devResetLink);
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
          <h2>Un oubli, ça arrive.</h2>
          <p>
            Indiquez votre adresse email : si un compte existe, vous
            recevrez un lien pour choisir un nouveau mot de passe.
          </p>
          <span className="hero-badge">ENTRETIEN VELO GARANTI</span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-card">
          <h3>Mot de passe oublié</h3>
          <p className="subtitle">
            Nous vous enverrons un lien de réinitialisation valable 1 heure.
          </p>

          {error && <p className="error-message">{error}</p>}

          {sent ? (
            <>
              <p className="success-message">
                Si un compte existe avec cette adresse, un email contenant un
                lien de réinitialisation vient d’être envoyé.
              </p>
              {/* Uniquement affiché en développement (pas de provider email branché en MVP) */}
              {devLink && (
                <p className="form-hint">
                  Mode dev — lien direct : <a href={devLink}>{devLink}</a>
                </p>
              )}
              <a href="/login" className="btn-secondary create-account">
                Retour à la connexion
              </a>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Envoi…" : "Envoyer le lien"}
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