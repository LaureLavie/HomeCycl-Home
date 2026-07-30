// front/app/technicien/interventions/[id]/PhotoUpload.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUpload({ interventionId, existingPhotos }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("AVANT");
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Sélectionnez au moins une photo.");
      return;
    }
    setUploading(true);
    setError(null);

    // multipart/form-data — même contrat que Multer côté back (champ "photos", max 5)
    const formData = new FormData();
    formData.append("type", type);
    files.forEach((file) => formData.append("photos", file));

    try {
      const res = await fetch(`/api/technicien/interventions/${interventionId}/photos`, {
        method: "POST",
        body: formData, // pas de header Content-Type manuel : le navigateur fixe le boundary
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card card__body">
      <h3>Photos ({existingPhotos.length})</h3>

      {existingPhotos.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-xs)", marginBottom: "var(--space-md)" }}>
          {existingPhotos.map((p) => (
            <img
              key={p.id_photo}
              src={p.url_photo}
              alt={p.type}
              style={{ width: "100%", height: "6rem", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
            />
          ))}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label className="form-label" htmlFor="photo-type">Type</label>
          <select id="photo-type" className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="AVANT">Avant intervention</option>
            <option value="APRES">Après intervention</option>
            <option value="DETAIL">Détail</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="photo-files">Fichiers (5 max, 10 Mo max/photo)</label>
          <input
            id="photo-files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
          {uploading ? "Envoi…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}