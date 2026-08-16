// front/app/admin/zones/GoogleZoneMap.jsx
"use client";

import { useCallback, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon } from "@react-google-maps/api";

const LIBRARIES = ["drawing", "geometry"];

// Centre par défaut : Lyon (zone d'activité HomeCycl'Home)
const LYON_CENTER = { lat: 45.764, lng: 4.8357 };

const mapContainerStyle = {
  height: "70vh",
  width: "100%",
  borderRadius: "var(--radius-lg)",
};

// ─────────────────────────────────────────────
// Conversion Google Maps Polygon → GeoJSON
// Le back attend un GeoJSON stocké en TEXT (colonne `geojson`)
// ─────────────────────────────────────────────
const polygonToGeoJson = (polygon) => {
  const path = polygon.getPath();
  const coordinates = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coordinates.push([point.lng(), point.lat()]); // GeoJSON = [lng, lat]
  }
  // Ferme l'anneau (premier point = dernier point, requis par la spec GeoJSON)
  if (coordinates.length > 0) coordinates.push(coordinates[0]);

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
};

// ─────────────────────────────────────────────
// Conversion GeoJSON → chemin Google Maps (pour l'affichage des zones existantes)
// ─────────────────────────────────────────────
const geoJsonToPath = (geojson) => {
  try {
    const parsed = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    const ring = parsed.geometry?.coordinates?.[0] || parsed.coordinates?.[0];
    if (!ring) return null;
    return ring.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
};

export default function GoogleZoneMap({ zones, onPolygonDrawn }) {
  const [map, setMap] = useState(null);
  const drawnPolygonRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-zones",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: "3.55",           // ← ajouté : dernière version stable avec Drawing
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // MAP-04 : dessin terminé → conversion GeoJSON + remontée au parent
  const handlePolygonComplete = useCallback(
    (polygon) => {
      // On ne garde qu'un seul tracé actif à la fois (évite d'accumuler les polygones temporaires)
      if (drawnPolygonRef.current) {
        drawnPolygonRef.current.setMap(null);
      }
      drawnPolygonRef.current = polygon;

      const geojson = polygonToGeoJson(polygon);
      onPolygonDrawn(geojson);
    },
    [onPolygonDrawn]
  );

  if (loadError) {
    return <p className="form-error">Erreur de chargement de Google Maps. Vérifiez la clé API.</p>;
  }

  if (!isLoaded) {
    return <p className="text-muted">Chargement de la carte…</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={LYON_CENTER}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Outils de dessin — polygone uniquement, équivalent Geoman */}
      <DrawingManager
        onPolygonComplete={handlePolygonComplete}
        options={{
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            fillColor: "#56df5c",
            fillOpacity: 0.25,
            strokeColor: "#3fc046",
            strokeWeight: 2,
            editable: true,
          },
        }}
      />

      {/* Zones existantes — affichage en lecture seule, en gris */}
      {zones.map((zone) => {
        const path = geoJsonToPath(zone.geojson);
        if (!path) return null;
        return (
          <Polygon
            key={zone.id_zone}
            path={path}
            options={{
              fillColor: "#644932",
              fillOpacity: 0.1,
              strokeColor: "#644932",
              strokeWeight: 1.5,
              clickable: false,
            }}
          />
        );
      })}
    </GoogleMap>
  );
}