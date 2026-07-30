// front/app/admin/zones/ZoneManager.jsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Chargement dynamique conservé : évite tout rendu SSR du script Google Maps
const GoogleZoneMap = dynamic(() => import("./GoogleZoneMap"), {
  ssr: false,
  loading: () => <p className="text-muted">Chargement de la carte…</p>,
});

export default function ZoneManager({ initialZones }) {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Signature inchangée : reçoit toujours un objet GeoJSON depuis le composant carte
  const handlePolygonDrawn = (geojson) => {
    setSelectedZone((prev) => ({
      ...(prev || { nom: "", description: "", frais_deplacement: "" }),
      geojson: JSON.stringify(geojson),
    }));
  };

  const handleSaveZone = async () => {
    if (!selectedZone?.geojson) {
      setError("Dessinez d'abord une zone sur la carte.");
      return;
    }
    if (!selectedZone.nom) {
      setError("Le nom de la zone est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const isEdit = Boolean(selectedZone.id_zone);
      const url = isEdit ? `/api/admin/zones/${selectedZone.id_zone}` : "/api/admin/zones";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: selectedZone.nom,
          description: selectedZone.description,
          geojson: selectedZone.geojson,
          frais_deplacement: selectedZone.frais_deplacement
            ? Number(selectedZone.frais_deplacement)
            : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      setSelectedZone(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (id, nom) => {
    if (!confirm(`Supprimer la zone "${nom}" ? (impossible si des interventions y sont rattachées)`)) return;
    try {
      const res = await fetch(`/api/admin/zones/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 380px", gap: "var(--space-lg)", alignItems: "start" }}>
      <div>
        {error && <p className="form-error">{error}</p>}
        <GoogleZoneMap
          zones={initialZones}
          activeGeojson={selectedZone?.geojson}
          onPolygonDrawn={handlePolygonDrawn}
        />
      </div>

      <aside>
        <div className="card card__body" style={{ marginBottom: "var(--space-md)" }}>
          <h3>{selectedZone?.id_zone ? "Modifier la zone" : "Nouvelle zone"}</h3>
          <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginBottom: "var(--space-sm)" }}>
            Dessinez un polygone sur la carte (outil en haut à gauche), puis remplissez les infos.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="zone-nom">Nom</label>
            <input
              id="zone-nom"
              className="form-input"
              value={selectedZone?.nom || ""}
              onChange={(e) => setSelectedZone({ ...(selectedZone || {}), nom: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zone-desc">Description</label>
            <textarea
              id="zone-desc"
              className="form-input"
              rows={2}
              value={selectedZone?.description || ""}
              onChange={(e) => setSelectedZone({ ...(selectedZone || {}), description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zone-frais">Frais de déplacement (€)</label>
            <input
              id="zone-frais"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={selectedZone?.frais_deplacement || ""}
              onChange={(e) => setSelectedZone({ ...(selectedZone || {}), frais_deplacement: e.target.value })}
            />
          </div>

          <div className="flex" style={{ gap: "var(--space-sm)" }}>
            <button className="btn btn-primary btn-sm" onClick={handleSaveZone} disabled={saving}>
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
            {selectedZone && (
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedZone(null)} disabled={saving}>
                Annuler
              </button>
            )}
          </div>
        </div>

        <h3>Zones existantes</h3>
        <ul>
          {initialZones.map((z) => (
            <li key={z.id_zone} className="flex-between" style={{ padding: "var(--space-xs) 0" }}>
              <div>
                <strong>{z.nom}</strong>
                <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
                  {z.techniciens?.length ?? 0} technicien(s) — {z._count?.interventions ?? 0} intervention(s)
                </p>
              </div>
              <div className="flex" style={{ gap: "var(--space-xs)" }}>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedZone({ ...z })}
                >
                  Éditer
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => handleDeleteZone(z.id_zone, z.nom)}>
                  Suppr.
                </button>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}