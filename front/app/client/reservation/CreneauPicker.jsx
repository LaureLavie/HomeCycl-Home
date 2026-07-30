// front/app/client/reservation/CreneauPicker.jsx
"use client";

import { useEffect, useState } from "react";

export default function CreneauPicker({ id_forfait, id_zone, onSelect }) {
  const [creneaux, setCreneaux] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dateDebut = new Date().toISOString().split("T")[0];
    fetch(`/api/creneaux?id_forfait=${id_forfait}&id_zone=${id_zone}&date_debut=${dateDebut}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setCreneaux(result.data);
      })
      .catch((err) => setError(err.message));
  }, [id_forfait, id_zone]);

  if (error) return <p className="form-error">{error}</p>;
  if (!creneaux) return <p className="text-muted">Recherche des créneaux disponibles…</p>;
  if (creneaux.total === 0) return <p className="text-muted">Aucun créneau disponible sur les 7 prochains jours dans votre zone.</p>;

  return (
    <div>
      <h3>Choisissez un créneau</h3>
      {Object.entries(creneaux.parJour).map(([jour, listeCreneaux]) => (
        <div key={jour} style={{ marginBottom: "var(--space-md)" }}>
          <p className="text-muted">{new Date(jour).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <div className="flex" style={{ flexWrap: "wrap", gap: "var(--space-xs)" }}>
            {listeCreneaux.map((c, i) => (
              <button
                key={i}
                className="btn btn-outline btn-sm"
                onClick={() => onSelect(c)}
              >
                {c.heure_debut} — {c.technicien.prenom} {c.technicien.nom[0]}.
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}