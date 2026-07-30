// front/app/technicien/clients/[id]/ClientTechForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientTechForm({ client }) {
  const router = useRouter();
  const [form, setForm] = useState({
    telephone: client.telephone || "",
    adresse: client.adresse,
    code_postal: client.code_postal,
    ville: client.ville,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/technicien/clients/${client.id_client}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card card__body" style={{ maxWidth: "28rem" }}>
      {error && <p className="form-error">{error}</p>}
      {[
        ["telephone", "Téléphone"],
        ["adresse", "Adresse"],
        ["code_postal", "Code postal"],
        ["ville", "Ville"],
      ].map(([name, label]) => (
        <div className="form-group" key={name}>
          <label className="form-label" htmlFor={name}>{label}</label>
          <input id={name} name={name} className="form-input" value={form[name]} onChange={handleChange} disabled={saving} />
        </div>
      ))}
      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}