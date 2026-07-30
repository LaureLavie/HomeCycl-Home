// front/app/admin/clients/[id]/ClientForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientForm({ client }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: client.nom,
    prenom: client.prenom,
    telephone: client.telephone || "",
    adresse: client.adresse,
    code_postal: client.code_postal,
    ville: client.ville,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/clients/${client.id_client}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card card__body" style={{ maxWidth: "32rem" }}>
      {error && <p className="form-error">{error}</p>}
      {success && <p style={{ color: "var(--color-primary-accent-dark)" }}>Enregistré ✓</p>}

      {[
        ["nom", "Nom"],
        ["prenom", "Prénom"],
        ["telephone", "Téléphone"],
        ["adresse", "Adresse"],
        ["code_postal", "Code postal"],
        ["ville", "Ville"],
      ].map(([name, label]) => (
        <div className="form-group" key={name}>
          <label className="form-label" htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            className="form-input"
            value={form[name]}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
      ))}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}