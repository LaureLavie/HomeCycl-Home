// front/app/client/velos/VeloForm.jsx
"use client";

import { useState } from "react";

export default function VeloForm({ velo, onClose, onSaved }) {
  const isEdit = Boolean(velo.id_velo);
  const [form, setForm] = useState({
    marque: velo.marque || "",
    modele: velo.modele || "",
    annee: velo.annee || new Date().getFullYear(),
    type_velo: velo.type_velo || "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = isEdit ? `/api/client/velos/${velo.id_velo}` : "/api/client/velos";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, annee: Number(form.annee) }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card card__body" style={{ maxWidth: "26rem", marginBottom: "var(--space-lg)" }}>
      <h3>{isEdit ? "Modifier le vélo" : "Nouveau vélo"}</h3>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label className="form-label" htmlFor="marque">Marque</label>
        <input id="marque" name="marque" className="form-input" value={form.marque} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="modele">Modèle</label>
        <input id="modele" name="modele" className="form-input" value={form.modele} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="annee">Année</label>
        <input id="annee" name="annee" type="number" min="1900" max={new Date().getFullYear() + 1} className="form-input" value={form.annee} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="type_velo">Type</label>
        <input id="type_velo" name="type_velo" className="form-input" value={form.type_velo} onChange={handleChange} placeholder="VTT, route, VAE…" required />
      </div>

      <div className="flex" style={{ gap: "var(--space-sm)" }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Annuler</button>
      </div>
    </form>
  );
}