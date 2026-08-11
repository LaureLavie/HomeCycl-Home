// front/app/client/reservation/ReservationWizard.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressPicker from "./AddressPicker";
import CreneauPicker from "./CreneauPicker";

const ETAPES = ["Adresse", "Forfait & vélo", "Créneau", "Confirmation"];

export default function ReservationWizard({ forfaits, produits, velos, zones }) {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    adresse_intervention: "",
    code_postal_intervention: "",
    ville_intervention: "",
    id_zone: null,
    id_forfait: "",
    id_velo: "",
    produits_selectionnes: [],
    creneau: null,
    commentaire: "",
  });

  const forfaitChoisi = forfaits.find((f) => f.id_forfait === data.id_forfait);

  // Un vélo n'est exigé que si le visiteur en a au moins un enregistré
  // (compte CLIENT connecté). Un visiteur anonyme ou un client sans vélo
  // peut réserver sans en sélectionner — cohérent avec le backend, où
  // id_velo est optionnel (createReservationSchema).
  const veloRequis = velos.length > 0;
  const etapeIncomplete = !data.id_forfait || (veloRequis && !data.id_velo);

  const handleAddressResolved = ({ adresse, code_postal, ville, id_zone }) => {
    setData((d) => ({
      ...d,
      adresse_intervention: adresse,
      code_postal_intervention: code_postal,
      ville_intervention: ville,
      id_zone,
    }));
    if (id_zone) setEtape(1);
    else setError("Cette adresse ne se situe dans aucune de nos zones d'intervention.");
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/client/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adresse_intervention: data.adresse_intervention,
          code_postal_intervention: data.code_postal_intervention,
          ville_intervention: data.ville_intervention,
          date_intervention: data.creneau.datetime_debut,
          id_forfait: data.id_forfait,
          // Jamais de chaîne vide : le backend attend un UUID valide OU l'absence du champ
          ...(data.id_velo && { id_velo: data.id_velo }),
          id_zone: data.id_zone,
          id_technicien: data.creneau.id_technicien,
          produits: data.produits_selectionnes,
          commentaire: data.commentaire,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      // RESA-05 : si réservation anonyme, le back renvoie un hint de redirection
      if (result.requiresAccount) {
        router.push(result.redirect);
      } else {
        router.push(`/client/historique`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
        {ETAPES.map((label, i) => (
          <span key={label} className="badge" style={{ opacity: i === etape ? 1 : 0.4 }}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {etape === 0 && <AddressPicker zones={zones} onResolved={handleAddressResolved} />}

      {etape === 1 && (
        <div className="card card__body" style={{ maxWidth: "32rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="forfait">Forfait</label>
            <select id="forfait" className="form-input" value={data.id_forfait} onChange={(e) => setData({ ...data, id_forfait: e.target.value })}>
              <option value="">— Choisir —</option>
              {forfaits.map((f) => (
                <option key={f.id_forfait} value={f.id_forfait}>{f.nom} — {f.prix} € ({f.duree_minutes} min)</option>
              ))}
            </select>
          </div>

          {veloRequis ? (
            <div className="form-group">
              <label className="form-label" htmlFor="velo">Vélo concerné</label>
              <select id="velo" className="form-input" value={data.id_velo} onChange={(e) => setData({ ...data, id_velo: e.target.value })}>
                <option value="">— Choisir —</option>
                {velos.map((v) => (
                  <option key={v.id_velo} value={v.id_velo}>{v.marque} {v.modele}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginBottom: "var(--space-md)" }}>
              Vous n&apos;avez pas encore de vélo enregistré — vous pourrez en ajouter un
              depuis votre espace client après cette réservation.
            </p>
          )}

          <fieldset className="form-group">
            <legend className="form-label">Produits additionnels</legend>
            {produits.map((p) => {
              const selected = data.produits_selectionnes.find((s) => s.id_produit === p.id_produit);
              return (
                <label key={p.id_produit} className="flex" style={{ gap: "var(--space-xs)", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(selected)}
                    onChange={(e) => {
                      setData((d) => ({
                        ...d,
                        produits_selectionnes: e.target.checked
                          ? [...d.produits_selectionnes, { id_produit: p.id_produit, quantite: 1 }]
                          : d.produits_selectionnes.filter((s) => s.id_produit !== p.id_produit),
                      }));
                    }}
                  />
                  {p.nom} (+{p.prix} €)
                </label>
              );
            })}
          </fieldset>

          <div className="form-group">
            <label className="form-label" htmlFor="commentaire">Commentaire (optionnel)</label>
            <textarea id="commentaire" className="form-input" rows={2} value={data.commentaire} onChange={(e) => setData({ ...data, commentaire: e.target.value })} />
          </div>

          <button
            className="btn btn-primary btn-sm"
            disabled={etapeIncomplete}
            onClick={() => setEtape(2)}
          >
            Continuer
          </button>
        </div>
      )}

      {etape === 2 && forfaitChoisi && (
        <CreneauPicker
          id_forfait={data.id_forfait}
          id_zone={data.id_zone}
          onSelect={(creneau) => {
            setData((d) => ({ ...d, creneau }));
            setEtape(3);
          }}
        />
      )}

      {etape === 3 && data.creneau && (
        <div className="card card__body" style={{ maxWidth: "28rem" }}>
          <h3>Récapitulatif</h3>
          <p>{data.adresse_intervention}, {data.code_postal_intervention} {data.ville_intervention}</p>
          <p>{forfaitChoisi.nom} — {new Date(data.creneau.datetime_debut).toLocaleString("fr-FR")}</p>
          <p className="text-muted">Technicien : {data.creneau.technicien.nom} {data.creneau.technicien.prenom}</p>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ marginTop: "var(--space-md)" }}>
            {saving ? "Réservation…" : "Confirmer la réservation"}
          </button>
        </div>
      )}
    </div>
  );
}