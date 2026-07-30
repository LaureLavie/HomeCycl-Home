// front/app/technicien/planning/page.jsx
import { apiFetch } from "@/lib/apiFetch";

export const metadata = { title: "Mon planning — Technicien" };

export default async function PlanningTechnicienPage({ searchParams }) {
  const params = await searchParams;
  const query = params.date_debut
    ? `?date_debut=${params.date_debut}&date_fin=${params.date_fin || ""}`
    : "";

  const result = await apiFetch(`/api/technicien/planning${query}`);
  const { periode, total, parJour } = result.data;

  const jours = Object.keys(parJour).sort();

  return (
    <>
      <h1>Mon planning</h1>
      <p className="text-muted">
        Semaine du {new Date(periode.debut).toLocaleDateString("fr-FR")} au{" "}
        {new Date(periode.fin).toLocaleDateString("fr-FR")} — {total} intervention(s)
      </p>

      {jours.length === 0 && <p className="text-muted">Aucune intervention planifiée cette semaine.</p>}

      {jours.map((jour) => (
        <div className="card card__body" key={jour} style={{ marginBottom: "var(--space-md)" }}>
          <h3>{new Date(jour).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</h3>
          <ul>
            {parJour[jour].map((interv) => (
              <li key={interv.id_intervention} style={{ padding: "var(--space-xs) 0" }}>
                <a href={`/technicien/interventions/${interv.id_intervention}`}>
                  {interv.heure_debut
                    ? new Date(interv.heure_debut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                    : "Heure non définie"}{" "}
                  — {interv.client?.nom} {interv.client?.prenom} — {interv.forfait?.nom} — {interv.statut}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}