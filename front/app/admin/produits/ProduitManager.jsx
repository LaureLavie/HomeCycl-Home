// front/app/admin/produits/ProduitManager.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProduitForm from "./ProduitForm";

export default function ProduitManager({ initialProduits }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (id, nom) => {
    if (!confirm(`Désactiver/supprimer le produit "${nom}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/produits/${id}`, { method: "DELETE" });
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
        + Nouveau produit
      </button>

      {editing && (
        <ProduitForm
          produit={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Utilisations</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {initialProduits.map((p) => (
            <tr key={p.id_produit}>
              <td>{p.nom}</td>
              <td>{p.prix} €</td>
              <td>{p.actif ? "Actif" : "Inactif"}</td>
              <td>{p._count?.inclure ?? 0}</td>
              <td className="flex" style={{ gap: "var(--space-xs)" }}>
                <button className="btn btn-sm btn-outline" onClick={() => setEditing(p)}>Modifier</button>
                <button className="btn btn-sm btn-outline" onClick={() => handleDelete(p.id_produit, p.nom)}>
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