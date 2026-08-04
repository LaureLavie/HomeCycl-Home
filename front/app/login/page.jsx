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
    <main className="login-page" style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      
      {/* Section Hero (Gauche) */}
      <section className="login-hero" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem" }}>
        <div className="login-hero-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <span className="hero-badge" style={{ width: "fit-content" }}>ENTRETIEN VÉLO GARANTI</span>
          <h1 style={{ margin: 0 }}>HomeCycl’Home</h1>
          <h2 style={{ margin: 0 }}>L’Artisan du Vélo Lyonnais à votre porte.</h2>
          <p style={{ margin: 0 }}>
            Simplifiez l’entretien de votre vélo avec un service de qualité,
            local et passionné. Nous nous déplaçons chez vous.
          </p>
        </div>
      </section>

      {/* Section Formulaire (Droite) */}
      <section className="login-form-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        
        {/* Carte principale */}
        <div className="login-form-card" style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "420px", padding: "2.5rem", boxSizing: "border-box" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.75rem" }}>Bon retour.</h3>
            <p className="subtitle" style={{ margin: 0 }}>Accédez à votre garage virtuel et vos rendez-vous.</p>
          </div>

          {error && <p className="error-message" style={{ margin: 0 }}>{error}</p>}

          {/* Formulaire en colonne avec de grands espaces */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", fontSize: "0.875rem" }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="nom@exemple.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: "600", fontSize: "0.875rem" }}>Mot de passe</label>
                <a className="forgot-link" href="/forgot-password" style={{ fontSize: "0.85rem" }}>Oublié ?</a>
              </div>
              <input
                type="password"
                name="mot_passe"
                placeholder="••••••••"
                value={form.mot_passe}
                onChange={handleChange}
                required
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ padding: "0.875rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="divider" style={{ textAlign: "center", color: "#888", fontSize: "0.85rem" }}>ou</div>
          
          <a href="/inscription" className="btn-secondary create-account" style={{ textAlign: "center", padding: "0.875rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
            Créer un compte client
          </a>
        </div>

        {/* Footer */}
        <footer className="login-footer" style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
          <a href="/help">Aide</a>
          <a href="/legal">Mentions légales</a>
          <a href="/contact">Contact</a>
        </footer>
      </section>
    </main>
  );
}