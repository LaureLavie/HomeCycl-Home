// front/app/client/reservation/ReservationWizard.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressPicker from "./AddressPicker";
import CreneauPicker from "./CreneauPicker";

// US-21/22/23 : Tunnel de réservation — fonctionne pour un visiteur anonyme
// ET pour un client déjà connecté (le backend décide via le JWT optionnel).
// Compétence CDA : Développer des composants métier — Interfaces utilisateur
const ETAPES = [
  { key: "adresse", label: "Étape 1 : Adresse" },
  { key: "service", label: "Étape 2 : Service" },
  { key: "date", label: "Étape 3 : Date" },
  { key: "paiement", label: "Étape 4 : Paiement" },
];

export default function ReservationWizard({ forfaits, produits, velos, zones, initialForfaitId = "" }) {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    adresse_intervention: "",
    code_postal_intervention: "",
    ville_intervention: "",
    complement: "",
    code_acces: "",
    id_zone: null,
    id_forfait: initialForfaitId || "",
    id_velo: "",
    produits_selectionnes: [],
    creneau: null,
    commentaire: "",
  });

  const forfaitChoisi = forfaits.find((f) => f.id_forfait === data.id_forfait);

  // Un vélo n'est exigé que si le visiteur en a au moins un enregistré
  // (compte CLIENT connecté). Un visiteur anonyme ou un client sans vélo
  // peut réserver sans en sélectionner — id_velo est optionnel côté backend.
  const veloRequis = velos.length > 0;
  const etapeServiceIncomplete = !data.id_forfait || (veloRequis && !data.id_velo);

  const handleAddressResolved = (resolu) => {
    setData((d) => ({
      ...d,
      adresse_intervention: resolu.adresse,
      code_postal_intervention: resolu.code_postal,
      ville_intervention: resolu.ville,
      id_zone: resolu.id_zone,
      complement: resolu.complement,
      code_acces: resolu.code_acces,
    }));
    setError(null);
    setEtape(1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      // Complément et code d'accès n'ont pas de colonne dédiée en base :
      // on les intègre au commentaire, lu par le technicien avant intervention.
      const notes = [];
      if (data.complement) notes.push(`Complément d'adresse : ${data.complement}`);
      if (data.code_acces) notes.push(`Code d'accès : ${data.code_acces}`);
      if (data.commentaire) notes.push(data.commentaire);

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
          commentaire: notes.join(" — "),
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

  const totalEstime =
    (forfaitChoisi ? Number(forfaitChoisi.prix || 0) : 0) +
    data.produits_selectionnes.reduce((sum, sel) => {
      const p = produits.find((pr) => pr.id_produit === sel.id_produit);
      return sum + (p ? Number(p.prix || 0) * sel.quantite : 0);
    }, 0);

  return (
    <div className="reservation-shell">
      {/* ---------- Bandeau ---------- */}
      <header className="reservation-topbar">
        <span className="logo">HomeCycl&apos;Home</span>
        <Link href="/" className="reservation-quit">✕ Quitter</Link>
      </header>

      {/* ---------- Jauge d'étapes ---------- */}
      <div className="reservation-steps">
        {ETAPES.map((e, i) => (
          <div className="reservation-steps__col" key={e.key}>
            <p className={`reservation-steps__label${i === etape ? " is-active" : ""}`}>{e.label}</p>
            <div className={`reservation-steps__bar${i <= etape ? " is-filled" : ""}`} />
          </div>
        ))}
      </div>

      {/* ---------- Contenu de l'étape ---------- */}
      <div className="reservation-content">
        {error && <p className="form-error" style={{ marginBottom: "var(--space-md)" }}>{error}</p>}

        {etape === 0 && <AddressPicker zones={zones} onResolved={handleAddressResolved} />}

        {etape === 1 && (
          <div className="reservation-step-grid">
            <div>
              <h2 style={{ color: "var(--color-secondary-accent-dark)" }}>Choisissez votre service</h2>
              <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                Sélectionnez le forfait adapté à votre vélo, et ajoutez d&apos;éventuels produits.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="forfait">Forfait</label>
                <select
                  id="forfait"
                  className="form-input"
                  value={data.id_forfait}
                  onChange={(e) => setData({ ...data, id_forfait: e.target.value })}
                >
                  <option value="">— Choisir —</option>
                  {forfaits.map((f) => (
                    <option key={f.id_forfait} value={f.id_forfait}>
                      {f.nom} — {f.prix} € ({f.duree_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {veloRequis ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="velo">Vélo concerné</label>
                  <select
                    id="velo"
                    className="form-input"
                    value={data.id_velo}
                    onChange={(e) => setData({ ...data, id_velo: e.target.value })}
                  >
                    <option value="">— Choisir —</option>
                    {velos.map((v) => (
                      <option key={v.id_velo} value={v.id_velo}>{v.marque} {v.modele}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginBottom: "var(--space-md)" }}>
                  Vous n&apos;avez pas encore de vélo enregistré — vous pourrez en
                  ajouter un depuis votre espace client après cette réservation.
                </p>
              )}

              {produits.length > 0 && (
                <fieldset className="form-group">
                  <legend className="form-label">Produits additionnels</legend>
                  {produits.map((p) => {
                    const selected = data.produits_selectionnes.find((s) => s.id_produit === p.id_produit);
                    return (
                      <label key={p.id_produit} className="flex" style={{ gap: "var(--space-xs)", alignItems: "center", padding: "var(--space-xxs) 0" }}>
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
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="commentaire">Commentaire (optionnel)</label>
                <textarea
                  id="commentaire"
                  className="form-input"
                  rows={2}
                  value={data.commentaire}
                  onChange={(e) => setData({ ...data, commentaire: e.target.value })}
                />
              </div>

              <button
                className="btn btn-primary"
                disabled={etapeServiceIncomplete}
                onClick={() => setEtape(2)}
              >
                Suivant : Choisir la date →
              </button>
            </div>

            {forfaitChoisi && (
              <aside className="card card__body">
                <h3>Récapitulatif</h3>
                <p style={{ marginTop: "var(--space-sm)" }}>{forfaitChoisi.nom}</p>
                <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>{forfaitChoisi.duree_minutes} min</p>
                <p style={{ fontSize: "var(--fs-500)", fontWeight: 700, marginTop: "var(--space-sm)" }}>
                  {totalEstime.toFixed(2)} €
                </p>
              </aside>
            )}
          </div>
        )}

        {etape === 2 && forfaitChoisi && (
          <div>
            <h2 style={{ color: "var(--color-secondary-accent-dark)", marginBottom: "var(--space-md)" }}>
              Choisissez un créneau
            </h2>
            <CreneauPicker
              id_forfait={data.id_forfait}
              id_zone={data.id_zone}
              onSelect={(creneau) => {
                setData((d) => ({ ...d, creneau }));
                setEtape(3);
              }}
            />
          </div>
        )}

        {etape === 3 && data.creneau && (
          <div className="reservation-step-grid">
            <div>
              <h2 style={{ color: "var(--color-secondary-accent-dark)" }}>Confirmation &amp; paiement</h2>
              <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                Vérifiez les informations avant de confirmer votre réservation.
              </p>

              <div className="info-note">
                <p>
                  <strong>Paiement :</strong> réglé directement auprès du technicien
                  à l&apos;issue de l&apos;intervention (carte bancaire ou espèces).
                </p>
              </div>

              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ marginTop: "var(--space-md)" }}>
                {saving ? "Confirmation en cours…" : "Confirmer la réservation"}
              </button>
            </div>

            <aside className="card card__body">
              <h3>Récapitulatif</h3>
              <p style={{ marginTop: "var(--space-sm)" }}>
                {data.adresse_intervention}, {data.code_postal_intervention} {data.ville_intervention}
              </p>
              {data.complement && <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>{data.complement}</p>}

              <p style={{ marginTop: "var(--space-sm)" }}>{forfaitChoisi.nom}</p>
              <p className="text-muted" style={{ fontSize: "var(--fs-200)" }}>
                {new Date(data.creneau.datetime_debut).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
                Technicien : {data.creneau.technicien.nom} {data.creneau.technicien.prenom}
              </p>

              <p style={{ fontSize: "var(--fs-500)", fontWeight: 700, marginTop: "var(--space-md)" }}>
                {totalEstime.toFixed(2)} €
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}