// front/app/admin/entreprise/EntrepriseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CHAMPS = [
  ["nom", "Nom de l'entreprise", true],
  ["siret", "SIRET (14 chiffres)"],
  ["adresse", "Adresse"],
  ["code_postal", "Code postal"],
  ["ville", "Ville"],
  ["telephone", "Téléphone"],
  ["email", "Email"],
  ["site_web", "Site web"],
];

export default function EntrepriseForm({ entreprise }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: entreprise?.nom || "",
    siret: entreprise?.siret || "",
    adresse: entreprise?.adresse || "",
    code_postal: entreprise?.code_postal || "",
    ville: entreprise?.ville || "",
    telephone: entreprise?.telephone || "",
    email: entreprise?.email || "",
    site_web: entreprise?.site_web || "",
    description: entreprise?.description || "",
  });
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrors([]);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/entreprise", {
        method: "POST", // upsert — ENT-04 : bouton "Sauvegarder"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setErrors(result.errors || []);
        throw new Error(result.message);
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card card__body" style={{ maxWidth: "36rem" }}>
      {error && <p className="form-error">{error}</p>}
      {errors.map((e) => (
        <p className="form-error" key={e.field}>{e.field} : {e.message}</p>
      ))}
      {success && <p style={{ color: "var(--color-primary-accent-dark)" }}>Informations sauvegardées ✓</p>}

      {CHAMPS.map(([name, label, required]) => (
        <div className="form-group" key={name}>
          <label className="form-label" htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            className="form-input"
            value={form[name]}
            onChange={handleChange}
            disabled={saving}
            required={required}
          />
        </div>
      ))}

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-input"
          rows={4}
          value={form.description}
          onChange={handleChange}
          disabled={saving}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}