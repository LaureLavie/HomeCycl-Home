// front/app/admin/utilisateurs/UserTable.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserTable({ initialData, pagination }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDeactivate = async (id) => {
    if (!confirm("Désactiver cet utilisateur ?")) return;
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh(); // relit les Server Components (page.jsx) avec les données à jour
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      {error && <p className="form-error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((u) => (
            <tr key={u.id_authentification}>
              <td>{u.email}</td>
              <td>{u.Role}</td>
              <td>{u.actif ? "Actif" : "Désactivé"}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={!u.actif || loadingId === u.id_authentification}
                  onClick={() => handleDeactivate(u.id_authentification)}
                >
                  {loadingId === u.id_authentification ? "…" : "Désactiver"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted">
        Page {pagination.page} / {pagination.totalPages} — {pagination.total} utilisateur(s)
      </p>
    </>
  );
}