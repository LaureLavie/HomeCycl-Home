// front/app/client/reservation/AddressPicker.jsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const LIBRARIES = ["places", "geometry"];

// ─────────────────────────────────────────────
// Détermine dans quelle zone se trouve un point (point-in-polygon)
// Réutilise la lib "geometry" de Google Maps, déjà chargée pour Zones/Leaflet→GoogleMaps
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

export default function AddressPicker({ zones, onResolved }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-zones", // même id que GoogleZoneMap : évite un double chargement du script
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef(null);
  const [error, setError] = useState(null);

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

    setError(null);
    onResolved({
      adresse: `${numero} ${rue}`.trim(),
      code_postal,
      ville,
      id_zone: zone?.id_zone || null,
    });
  };

  if (!isLoaded) return <p className="text-muted">Chargement…</p>;

  return (
    <div className="card card__body" style={{ maxWidth: "28rem" }}>
      <div className="form-group">
        <label className="form-label" htmlFor="address-autocomplete">Adresse d&apos;intervention</label>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={handlePlaceChanged}
          options={{ componentRestrictions: { country: "fr" }, fields: ["address_components", "geometry"] }}
        >
          <input
            id="address-autocomplete"
            type="text"
            className="form-input"
            placeholder="Tapez votre adresse…"
          />
        </Autocomplete>
      </div>
      {error && <p className="form-error">{error}</p>}
      <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
        Nous intervenons uniquement dans nos zones couvertes à Lyon et alentours.
      </p>
    </div>
  );
}