// front/app/client/historique/page.jsx
import { apiFetch } from "@/lib/apiFetch";

export const metadata = { title: "Historique — Client" };

export default async function HistoriquePage({ searchParams }) {
  const params = await searchParams;
  const page = params.page || "1";

  const result = await apiFetch(`/api/client/historique?page=${page}&limit=10`);
  const { data: interventions, pagination, stats } = result;

  return (
    <>
      <h1>Historique de mes interventions</h1>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "var(--space-lg)" }}>
        <div className="card card__body">
          <p className="text-muted">Total</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{stats.total}</p>
        </div>
        <div className="card card__body">
          <p className="text-muted">Terminées</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{stats.totalTerminees}</p>
        </div>
        <div className="card card__body">
          <p className="text-muted">Planifiées</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{stats.totalPlanifiees}</p>
        </div>
        <div className="card card__body">
          <p className="text-muted">Annulées</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{stats.totalAnnulees}</p>
        </div>
      </div>

      {interventions.length === 0 && (
        <p className="text-muted">Aucune intervention pour le moment.</p>
      )}

      {interventions.map((interv) => (
        <div className="card card__body" key={interv.id_intervention} style={{ marginBottom: "var(--space-md)" }}>
          <div className="flex-between">
            <h3>{new Date(interv.date_intervention).toLocaleDateString("fr-FR")}</h3>
            <span className="badge">{interv.statut}</span>
          </div>
          <p>{interv.forfait?.nom} — {interv.forfait?.prix} €</p>
          {interv.velo && (
            <p className="text-muted">{interv.velo.marque} {interv.velo.modele}</p>
          )}
          {interv.technicien && (
            <p className="text-muted">
              Technicien : {interv.technicien.nom} {interv.technicien.prenom}
            </p>
          )}
        </div>
      ))}

      <p className="text-muted">
        Page {pagination.page} / {pagination.totalPages} — {pagination.total} intervention(s)
      </p>
    </>
  );
}