// front/app/inscription/page.jsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_intervention_temp = searchParams.get("id_intervention");

  const [form, setForm] = useState({
    email: "", mot_passe: "", nom: "", prenom: "", telephone: "",
    adresse: "", code_postal: "", ville: "",
  });
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrors([]);
    try {
      const res = await fetch("/api/inscription/finaliser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id_intervention_temp }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setErrors(result.errors || []);
        throw new Error(result.message);
      }
      router.push(result.data.redirect || "/client/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: "32rem", paddingBlock: "var(--space-xl)" }}>
      <h1>Créez votre compte</h1>
      <p className="text-muted">Votre réservation a été enregistrée. Finalisez la création de votre compte pour la confirmer.</p>

      <form onSubmit={handleSubmit} className="card card__body">
        {error && <p className="form-error">{error}</p>}
        {errors.map((e) => <p className="form-error" key={e.field}>{e.field} : {e.message}</p>)}

        {[
          ["email", "Email", "email"], ["mot_passe", "Mot de passe", "password"],
          ["nom", "Nom", "text"], ["prenom", "Prénom", "text"], ["telephone", "Téléphone", "tel"],
          ["adresse", "Adresse", "text"], ["code_postal", "Code postal", "text"], ["ville", "Ville", "text"],
        ].map(([name, label, type]) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} className="form-input" value={form[name]} onChange={handleChange} required={name !== "telephone"} />
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </main>
  );
}
export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: "center", paddingBlock: "var(--space-xl)" }}>Chargement...</div>}>
      <InscriptionContent />
    </Suspense>
  );
}