// front/app/client/velos/VeloManager.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VeloForm from "./VeloForm";

export default function VeloManager({ initialVelos }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (id, label) => {
    if (!confirm(`Supprimer "${label}" ? (impossible si une intervention est en cours)`)) return;
    try {
      const res = await fetch(`/api/client/velos/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {error && <p className="form-error">{error}</p>}
      <p className="text-muted">{initialVelos.length} / 10 vélos enregistrés</p>

      <button
        className="btn btn-primary btn-sm"
        onClick={() => setEditing({})}
        disabled={initialVelos.length >= 10}
        style={{ marginBottom: "var(--space-md)" }}
      >
        + Ajouter un vélo
      </button>

      {editing && (
        <VeloForm
          velo={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {initialVelos.map((v) => (
          <div className="card card__body" key={v.id_velo}>
            <h3>{v.marque} {v.modele}</h3>
            <p className="text-muted">{v.annee} — {v.type_velo}</p>
            <div className="flex" style={{ gap: "var(--space-xs)", marginTop: "var(--space-sm)" }}>
              <button className="btn btn-sm btn-outline" onClick={() => setEditing(v)}>Modifier</button>
              <button className="btn btn-sm btn-outline" onClick={() => handleDelete(v.id_velo, `${v.marque} ${v.modele}`)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}