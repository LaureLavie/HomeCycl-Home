// front/app/admin/planning/PlanningView.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlanningView({ planning, techniciens, modeles }) {
  const router = useRouter();
  const [assignForm, setAssignForm] = useState({ id_technicien: "", id_modele_planification: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAssigner = async (e) => {
    e.preventDefault();
    if (!assignForm.id_technicien || !assignForm.id_modele_planification) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/planning/assigner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      setAssignForm({ id_technicien: "", id_modele_planification: "" });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 320px", gap: "var(--space-lg)", alignItems: "start" }}>
      <div>
        <p className="text-muted">
          Période : {new Date(planning.periode.debut).toLocaleDateString("fr-FR")} →{" "}
          {new Date(planning.periode.fin).toLocaleDateString("fr-FR")}
        </p>

        {planning.techniciens.map((t) => (
          <div className="card card__body" key={t.id_technicien} style={{ marginBottom: "var(--space-md)" }}>
            <h3>{t.nom} {t.prenom} — {t.nbInterventions} intervention(s)</h3>
            {t.interventions.length === 0 ? (
              <p className="text-muted">Aucune intervention sur cette période.</p>
            ) : (
              <ul>
                {t.interventions.map((i) => (
                  <li key={i.id_intervention}>
                    {new Date(i.date_intervention).toLocaleDateString("fr-FR")} —{" "}
                    {i.client?.nom} {i.client?.prenom} — {i.forfait?.nom} — {i.zone?.nom}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <aside>
        <div className="card card__body">
          <h3>Techniciens & zones</h3>
          <ul style={{ marginBottom: "var(--space-md)" }}>
            {techniciens.map((t) => (
              <li key={t.id_technicien}>
                <strong>{t.nom} {t.prenom}</strong>
                <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
                  {t.zones.map((z) => z.nom).join(", ") || "Aucune zone assignée"} —{" "}
                  {t.nbInterventions} intervention(s)
                </p>
              </li>
            ))}
          </ul>

          <h3>Assigner un modèle</h3>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleAssigner}>
            <div className="form-group">
              <label className="form-label" htmlFor="pl-tech">Technicien</label>
              <select
                id="pl-tech"
                className="form-input"
                value={assignForm.id_technicien}
                onChange={(e) => setAssignForm({ ...assignForm, id_technicien: e.target.value })}
                required
              >
                <option value="">— Choisir —</option>
                {techniciens.map((t) => (
                  <option key={t.id_technicien} value={t.id_technicien}>
                    {t.nom} {t.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pl-modele">Modèle de planification</label>
              <select
                id="pl-modele"
                className="form-input"
                value={assignForm.id_modele_planification}
                onChange={(e) => setAssignForm({ ...assignForm, id_modele_planification: e.target.value })}
                required
              >
                <option value="">— Choisir —</option>
                {modeles.map((m) => (
                  <option key={m.id_modele_planification} value={m.id_modele_planification}>
                    {m.nom}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "…" : "Assigner"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}