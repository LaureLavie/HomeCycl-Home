// front/app/technicien/interventions/[id]/ModifierForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModifierForm({ intervention }) {
  const router = useRouter();
  const [form, setForm] = useState({
    commentaire: intervention.commentaire || "",
    statut: intervention.statut,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/technicien/interventions/${intervention.id_intervention}`, {
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
    <form onSubmit={handleSubmit} className="card card__body" style={{ marginBottom: "var(--space-md)" }}>
      <h3>Modifier</h3>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label className="form-label" htmlFor="statut">Statut</label>
        <select
          id="statut"
          className="form-input"
          value={form.statut}
          onChange={(e) => setForm({ ...form, statut: e.target.value })}
        >
          {/* TECH-02 : le technicien ne peut choisir que ces 3 statuts.
              TERMINEE et ANNULEE ont leurs propres endpoints dédiés (irréversibles). */}
          <option value="PLANIFIEE">Planifiée</option>
          <option value="EN_COURS">En cours</option>
          <option value="ABSENT_CLIENT">Client absent</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="commentaire">Commentaire rapide</label>
        <textarea
          id="commentaire"
          className="form-input"
          rows={3}
          value={form.commentaire}
          onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? "Sauvegarde…" : "Enregistrer"}
      </button>
    </form>
  );
}