// front/app/technicien/interventions/InterventionFilters.jsx
"use client";

import { useRouter } from "next/navigation";

const STATUTS = ["", "PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE", "ABSENT_CLIENT"];

export default function InterventionFilters({ currentStatut }) {
  const router = useRouter();

  return (
    <div className="form-group" style={{ maxWidth: "16rem" }}>
      <label className="form-label" htmlFor="statut-filter">Filtrer par statut</label>
      <select
        id="statut-filter"
        className="form-input"
        value={currentStatut}
        onChange={(e) => router.push(`/technicien/interventions${e.target.value ? `?statut=${e.target.value}` : ""}`)}
      >
        {STATUTS.map((s) => (
          <option key={s} value={s}>{s || "Tous"}</option>
        ))}
      </select>
    </div>
  );
}