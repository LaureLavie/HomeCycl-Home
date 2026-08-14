"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "../../services/authService";

// US-02 : Inscription (compte CLIENT uniquement — ADMIN/TECHNICIEN créés par l'admin)
// Compétence CDA : Développer des composants métier — Interfaces utilisateur
export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    mot_passe: "",
    confirmation: "",
    adresse: "",
    code_postal: "",
    ville: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (form.mot_passe !== form.confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { confirmation, ...payload } = form;
      const result = await signupUser(payload);
      router.push(result.redirect || "/client/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      // AUTH-04 : erreurs de validation Zod renvoyées champ par champ
      if (err.errors) {
        const mapped = {};
        err.errors.forEach((fe) => {
          mapped[fe.field] = fe.message;
        });
        setFieldErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      
    {/* Section Hero (Gauche) */}
    <section className="login-hero" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem" }}>
      <div className="login-hero-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h1>HomeCycl’Home</h1>
          <h2>Rejoignez le garage virtuel lyonnais.</h2>
          <p>
            Créez votre compte pour réserver l’entretien de votre vélo à
            domicile, suivre vos interventions et retrouver votre historique.
          </p>
          <span className="hero-badge">ENTRETIEN VELO GARANTI</span>
        </div>
      </section>

      <section className="login-form-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        
        {/* Carte principale */}
        <div className="login-form-card" style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "420px", padding: "2.5rem", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3>Créer un compte</h3>
            <p className="subtitle">
              Quelques informations pour démarrer votre première réservation.
            </p>
</div>
            {error && <p className="error-message">{error}</p>}
 {/* Formulaire en colonne avec de grands espaces */}
 <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label>Nom</label>
              <input
                type="text"
              name="nom"
              placeholder="Votre nom"
              value={form.nom}
              onChange={handleChange}
              required
            />
            {fieldErrors.nom && <p className="error-message">{fieldErrors.nom}</p>}

            <label>Prénom</label>
            <input
              type="text"
              name="prenom"
              placeholder="Votre prénom"
              value={form.prenom}
              onChange={handleChange}
              required
            />
            {fieldErrors.prenom && <p className="error-message">{fieldErrors.prenom}</p>}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="nom@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}

            <label>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              placeholder="06 12 34 56 78"
              value={form.telephone}
              onChange={handleChange}
            />

            <label>Adresse</label>
            <input
              type="text"
              name="adresse"
              placeholder="12 rue de la République"
              value={form.adresse}
              onChange={handleChange}
              required
            />
            {fieldErrors.adresse && <p className="error-message">{fieldErrors.adresse}</p>}

            <label>Code postal</label>
            <input
              type="text"
              name="code_postal"
              placeholder="69001"
              value={form.code_postal}
              onChange={handleChange}
              required
            />
            {fieldErrors.code_postal && (
              <p className="error-message">{fieldErrors.code_postal}</p>
            )}

            <label>Ville</label>
            <input
              type="text"
              name="ville"
              placeholder="Lyon"
              value={form.ville}
              onChange={handleChange}
              required
            />
            {fieldErrors.ville && <p className="error-message">{fieldErrors.ville}</p>}

            <label>Mot de passe</label>
            <input
              type="password"
              name="mot_passe"
              placeholder="••••••••"
              value={form.mot_passe}
              onChange={handleChange}
              required
            />
            {fieldErrors.mot_passe && (
              <p className="error-message">{fieldErrors.mot_passe}</p>
            )}
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
            />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>
          </form>

          <div className="divider">ou</div>
          <a href="/login" className="btn-secondary create-account">
            J’ai déjà un compte
          </a>
        </div>

        <footer className="login-footer">
          <a href="/cgv">Conditions Générales de Vente</a>
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/contact">Contact</a>
        </footer>
      </section>
    </main>
  );
}