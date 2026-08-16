// front/app/client/reservation/AddressPicker.jsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { InfoIcon } from "../../components/Icons";

const LIBRARIES = ["places", "geometry"];
const LYON_CENTER = { lat: 45.764, lng: 4.8357 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// ─────────────────────────────────────────────
// Détermine dans quelle zone se trouve un point (point-in-polygon)
// Réutilise la lib "geometry" de Google Maps (même logique que GoogleZoneMap admin)
// ─────────────────────────────────────────────
const trouverZone = (latLng, zones) => {
  for (const zone of zones) {
    if (!zone.geojson) continue;
    const ring = zone.geojson.geometry?.coordinates?.[0];
    if (!ring) continue;
    const path = ring.map(([lng, lat]) => new window.google.maps.LatLng(lat, lng));
    const polygon = new window.google.maps.Polygon({ paths: path });
    if (window.google.maps.geometry.poly.containsLocation(latLng, polygon)) {
      return zone;
    }
  }
  return null;
};

// RESA-01 : Étape 1 — Adresse d'intervention (US-21)
// Compétence CDA : Développer des composants métier — Interfaces utilisateur (géolocalisation)
export default function AddressPicker({ zones, onResolved }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-zones",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: "3.55",           // ← même version des deux côtés, cohérence obligatoire
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef(null);
  const [error, setError] = useState(null);
  const [resolved, setResolved] = useState(null); // { adresse, code_postal, ville, id_zone, lat, lng }
  const [complement, setComplement] = useState("");
  const [codeAcces, setCodeAcces] = useState("");
  const [center, setCenter] = useState(LYON_CENTER);

  const onLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) {
      setError("Sélectionnez une adresse dans la liste proposée.");
      return;
    }

    const latLng = place.geometry.location;
    const zone = trouverZone(latLng, zones);

    // Extraction des composants d'adresse (format Google Places standard)
    const getComponent = (type) =>
      place.address_components.find((c) => c.types.includes(type))?.long_name || "";

    const numero = getComponent("street_number");
    const rue = getComponent("route");
    const code_postal = getComponent("postal_code");
    const ville = getComponent("locality");

    setError(zone ? null : "Cette adresse ne se situe dans aucune de nos zones d'intervention.");
    setCenter({ lat: latLng.lat(), lng: latLng.lng() });
    setResolved({
      adresse: `${numero} ${rue}`.trim(),
      code_postal,
      ville,
      id_zone: zone?.id_zone || null,
      lat: latLng.lat(),
      lng: latLng.lng(),
    });
  };

  const handleContinuer = () => {
    if (!resolved) {
      setError("Renseignez d'abord votre adresse d'intervention.");
      return;
    }
    if (!resolved.id_zone) {
      setError("Cette adresse ne se situe dans aucune de nos zones d'intervention.");
      return;
    }
    onResolved({ ...resolved, complement, code_acces: codeAcces });
  };

  if (loadError) {
    return <p className="form-error">Erreur de chargement de Google Maps. Vérifiez la clé API (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).</p>;
  }

  return (
    <div className="reservation-step-grid">
      {/* ---------- Colonne formulaire ---------- */}
      <div>
        <h2 style={{ color: "var(--color-secondary-accent-dark)" }}>Où devons-nous intervenir&nbsp;?</h2>
        <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
          Indiquez l&apos;adresse de prise en charge à Lyon et ses environs. Nous
          nous déplaçons directement chez vous ou sur votre lieu de travail.
        </p>

        {!isLoaded ? (
          <p className="text-muted">Chargement de l&apos;autocomplétion d&apos;adresse…</p>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="address-autocomplete">Adresse complète</label>
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={handlePlaceChanged}
              options={{ componentRestrictions: { country: "fr" }, fields: ["address_components", "geometry"] }}
            >
              <input
                id="address-autocomplete"
                type="text"
                className="form-input"
                placeholder="Ex : 12 Rue de la République, 69002 Lyon"
              />
            </Autocomplete>
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="complement">Complément (Appt, étage…)</label>
            <input
              id="complement"
              className="form-input"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              placeholder="Appartement 4B"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="code-acces">Code d&apos;accès / Interphone</label>
            <input
              id="code-acces"
              className="form-input"
              value={codeAcces}
              onChange={(e) => setCodeAcces(e.target.value)}
              placeholder="B123"
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="info-note">
          <InfoIcon />
          <p>
            <strong>Note :</strong> Nous intervenons uniquement dans le Grand Lyon.
            Si vous êtes hors zone, des frais de déplacement peuvent s&apos;appliquer.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleContinuer}
          disabled={!resolved || !resolved.id_zone}
          style={{ marginTop: "var(--space-md)" }}
        >
          Suivant : Choisir mon forfait →
        </button>
      </div>

      {/* ---------- Colonne carte ---------- */}
      <div className="reservation-map-card">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={resolved ? 14 : 12}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Circle
              center={center}
              radius={2200}
              options={{
                strokeColor: "#3fc046",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#56df5c",
                fillOpacity: 0.15,
              }}
            />
            <Marker position={center} />
          </GoogleMap>
        ) : (
          <div className="flex-center" style={{ height: "100%", background: "var(--color-secondary-bg)" }}>
            <p className="text-muted">Chargement de la carte…</p>
          </div>
        )}
        <span className="reservation-map-card__badge">
          {resolved
            ? resolved.id_zone
              ? "Zone de couverture active"
              : "Hors zone de couverture"
            : "Zone de couverture"}
        </span>
      </div>
    </div>
  );
}