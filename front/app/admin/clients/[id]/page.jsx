// front/app/admin/clients/[id]/page.jsx
import { apiFetch } from "../../../../lib/apiFetch";
import ClientForm from "./ClientForm";

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const result = await apiFetch(`/api/client/${id}`);
  const client = result.data;

  return (
    <>
      <h1>{client.nom} {client.prenom}</h1>
      <ClientForm client={client} />

      <h2 style={{ marginTop: "var(--space-xl)" }}>Vélos ({client.velos.length})</h2>
      <ul>
        {client.velos.map((v) => (
          <li key={v.id_velo}>{v.marque} {v.modele} ({v.annee}) — {v.type_velo}</li>
        ))}
      </ul>

      <h2 style={{ marginTop: "var(--space-xl)" }}>Interventions ({client.interventions.length})</h2>
      <ul>
        {client.interventions.map((i) => (
          <li key={i.id_intervention}>
            {new Date(i.date_intervention).toLocaleDateString("fr-FR")} — {i.statut} — {i.forfait?.nom}
            {i.technicien && ` — ${i.technicien.nom} ${i.technicien.prenom}`}
          </li>
        ))}
      </ul>
    </>
  );
}