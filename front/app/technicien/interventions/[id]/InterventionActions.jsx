// front/app/technicien/interventions/[id]/InterventionActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InterventionActions({ intervention, disabled }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null); // "terminer" | "annuler" | null

  const handleTerminer = async () => {
    if (!confirm("Marquer cette intervention comme terminée ? Cette action est définitive.")) return;
    setLoading("terminer");
    setError(null);
    try {
      const res = await fetch(`/api/technicien/interventions/${intervention.id_intervention}/terminer`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAnnuler = async () => {
    const motif = prompt("Motif d'annulation (optionnel) :");
    if (motif === null) return; // annulation du prompt lui-même
    setLoading("annuler");
    setError(null);
    try {
      const res = await fetch(`/api/technicien/interventions/${intervention.id_intervention}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  if (disabled) {
    return (
      <div className="card card__body" style={{ marginBottom: "var(--space-md)" }}>
        <p className="text-muted">Intervention {intervention.statut.toLowerCase()} — aucune action possible.</p>
      </div>
    );
  }

  return (
    <div className="card card__body" style={{ marginBottom: "var(--space-md)" }}>
      <h3>Actions</h3>
      {error && <p className="form-error">{error}</p>}
      <div className="flex" style={{ gap: "var(--space-sm)" }}>
        <button className="btn btn-primary btn-sm" onClick={handleTerminer} disabled={loading !== null}>
          {loading === "terminer" ? "…" : "✅ Marquer terminée"}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleAnnuler} disabled={loading !== null}>
          {loading === "annuler" ? "…" : "Annuler l'intervention"}
        </button>
      </div>
    </div>
  );
}