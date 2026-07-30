// front/app/admin/planning/page.jsx
import { apiFetch } from "./lib/apiFetch";
import PlanningView from "./PlanningView";

export const metadata = { title: "Planning — Admin" };

export default async function PlanningPage({ searchParams }) {
  const params = await searchParams;
  const query = params.date_debut
    ? `?date_debut=${params.date_debut}&date_fin=${params.date_fin || ""}`
    : "";

  const [planningResult, techniciensResult, modelesResult] = await Promise.all([
    apiFetch(`/api/planning/global${query}`),
    apiFetch("/api/planning/techniciens"),
    apiFetch("/api/planning/modeles"),
  ]);

  return (
    <>
      <h1>Planning global</h1>
      <PlanningView
        planning={planningResult.data}
        techniciens={techniciensResult.data}
        modeles={modelesResult.data}
      />
    </>
  );
}