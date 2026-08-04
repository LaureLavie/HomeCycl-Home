"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/authService.js";
import { saveToken } from "../../lib/auth.js";
import { MailIcon, LockIcon, ArrowRightIcon } from "./Icons";

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", mot_passe: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(form.email, form.mot_passe);

      // Le token est stocké dans un cookie pour être lu par middleware.js
      // (redirection par rôle sur les routes /admin, /technicien, /client)
      saveToken(result.data.token);

      // AUTH-08 : le back indique déjà la bonne route selon le rôle connecté
      router.push(result.redirect || "/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue. Réessayez."
      );
      setLoading(false);
    }
  };

  return (
    
    <form className="auth-split__form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p
          className="form-error"
          role="alert"
          style={{ marginBottom: "var(--space-md)" }}
        >
          {error}
        </p>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <div className="form-input-wrapper">
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nom@exemple.com"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <span className="form-input-icon" aria-hidden="true">
            <MailIcon />
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="mot_passe">
          Mot de passe
          <a className="form-label__hint" href="/forgot-password">
            Oublié ?
          </a>
        </label>
        <div className="form-input-wrapper">
          <input
            id="mot_passe"
            name="mot_passe"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="form-input"
            value={form.mot_passe}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <span className="form-input-icon" aria-hidden="true">
            <LockIcon />
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? (
          "Connexion…"
        ) : (
          <>
            <ArrowRightIcon size={16} />
            Se connecter
          </>
        )}
      </button>

      <div className="form-divider">ou</div>

      <p
        className="text-center text-muted"
        style={{ marginBottom: "var(--space-md)" }}
      >
        Nouveau chez HomeCycl&apos;Home&nbsp;?
      </p>

      <a href="/inscription" className="btn btn-outline btn-block">
        Créer un compte client
      </a>
    </form>
  );
}