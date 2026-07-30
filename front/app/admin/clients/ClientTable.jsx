// front/app/admin/clients/ClientTable.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientTable({ initialData, pagination, initialSearch }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || "");

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/clients?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
        <input
          className="form-input"
          placeholder="Nom, prénom, ville, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Ville</th>
            <th>Email</th>
            <th>Vélos</th>
            <th>Dernière intervention</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((c) => (
            <tr key={c.id_client}>
              <td>{c.nom} {c.prenom}</td>
              <td>{c.ville}</td>
              <td>{c.authentification?.email}</td>
              <td>{c.velos?.length ?? 0}</td>
              <td>
                {c.interventions?.[0]
                  ? new Date(c.interventions[0].date_intervention).toLocaleDateString("fr-FR")
                  : "—"}
              </td>
              <td>
                <Link href={`/admin/clients/${c.id_client}`} className="btn btn-sm btn-outline">
                  Détail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted">
        Page {pagination.page} / {pagination.totalPages} — {pagination.total} client(s)
      </p>
    </>
  );
}