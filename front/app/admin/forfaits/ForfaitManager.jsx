// front/app/admin/forfaits/ForfaitManager.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ForfaitForm from "./ForfaitForm";

export default function ForfaitManager({ initialForfaits }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // null = fermé, {} = création, {...} = édition
  const [error, setError] = useState(null);

  const handleDelete = async (id, nom) => {
    if (!confirm(`Désactiver/supprimer le forfait "${nom}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/forfaits/${id}`, { method: "DELETE" });
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

      <button className="btn btn-primary btn-sm" onClick={() => setEditing({})} style={{ marginBottom: "var(--space-md)" }}>
        + Nouveau forfait
      </button>

      {editing && (
        <ForfaitForm
          forfait={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type vélo</th>
            <th>Prix</th>
            <th>Durée</th>
            <th>Statut</th>
            <th>Utilisations</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {initialForfaits.map((f) => (
            <tr key={f.id_forfait}>
              <td>{f.nom}</td>
              <td>{f.type_velo || "Tous"}</td>
              <td>{f.prix} €</td>
              <td>{f.duree_minutes} min</td>
              <td>{f.actif ? "Actif" : "Inactif"}</td>
              <td>{f._count?.interventions ?? 0}</td>
              <td className="flex" style={{ gap: "var(--space-xs)" }}>
                <button className="btn btn-sm btn-outline" onClick={() => setEditing(f)}>Modifier</button>
                <button className="btn btn-sm btn-outline" onClick={() => handleDelete(f.id_forfait, f.nom)}>
                  Désactiver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}