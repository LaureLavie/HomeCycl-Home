// front/app/admin/produits/ProduitForm.jsx
"use client";

import { useState } from "react";

export default function ProduitForm({ produit, onClose, onSaved }) {
  const isEdit = Boolean(produit.id_produit);
  const [form, setForm] = useState({
    nom: produit.nom || "",
    description: produit.description || "",
    prix: produit.prix || "",
    actif: produit.actif ?? true,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = isEdit ? `/api/admin/produits/${produit.id_produit}` : "/api/admin/produits";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prix: Number(form.prix) }),
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
    <form onSubmit={handleSubmit} className="card card__body" style={{ maxWidth: "28rem", marginBottom: "var(--space-lg)" }}>
      <h3>{isEdit ? "Modifier le produit" : "Nouveau produit"}</h3>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label className="form-label" htmlFor="nom">Nom</label>
        <input id="nom" name="nom" className="form-input" value={form.nom} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="prix">Prix (€)</label>
        <input id="prix" name="prix" type="number" step="0.01" min="0" className="form-input" value={form.prix} onChange={handleChange} required />
      </div>

      <div className="form-group flex" style={{ flexDirection: "row", alignItems: "center", gap: "var(--space-xs)" }}>
        <input id="actif" name="actif" type="checkbox" checked={form.actif} onChange={handleChange} />
        <label htmlFor="actif">Actif</label>
      </div>

      <div className="flex" style={{ gap: "var(--space-sm)" }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
          Annuler
        </button>
      </div>
    </form>
  );
}