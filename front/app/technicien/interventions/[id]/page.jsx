// front/app/technicien/interventions/[id]/page.jsx
import { apiFetch } from "./lib/apiFetch";
import InterventionActions from "./InterventionActions";
import ModifierForm from "./ModifierForm";
import PhotoUpload from "./PhotoUpload";

export default async function InterventionDetailPage({ params }) {
  const { id } = await params;
  const result = await apiFetch(`/api/technicien/interventions/${id}`);
  const intervention = result.data;

  const estClose = intervention.statut === "TERMINEE" || intervention.statut === "ANNULEE";

  return (
    <>
      <h1>Intervention du {new Date(intervention.date_intervention).toLocaleDateString("fr-FR")}</h1>
      <p className="text-muted">Statut actuel : <strong>{intervention.statut}</strong></p>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
        <div className="card card__body">
          <h3>Client</h3>
          <p>{intervention.client?.nom} {intervention.client?.prenom}</p>
          <p>{intervention.client?.telephone}</p>
          <p>{intervention.adresse_intervention}</p>

          <h3 style={{ marginTop: "var(--space-md)" }}>Vélo</h3>
          <p>{intervention.velo?.marque} {intervention.velo?.modele} — {intervention.velo?.type_velo}</p>

          <h3 style={{ marginTop: "var(--space-md)" }}>Forfait</h3>
          <p>{intervention.forfait?.nom} — {intervention.forfait?.prix} € — {intervention.forfait?.duree_minutes} min</p>

          {intervention.inclure?.length > 0 && (
            <>
              <h3 style={{ marginTop: "var(--space-md)" }}>Produits additionnels</h3>
              <ul>
                {intervention.inclure.map((inc) => (
                  <li key={inc.id_produit}>{inc.produit.nom} x{inc.quantite}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          {!estClose && <ModifierForm intervention={intervention} />}
          <InterventionActions intervention={intervention} disabled={estClose} />
          <PhotoUpload interventionId={intervention.id_intervention} existingPhotos={intervention.photos} />
        </div>
      </div>
    </>
  );
}