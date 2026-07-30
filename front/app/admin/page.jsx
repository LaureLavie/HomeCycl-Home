// front/app/admin/page.jsx
import { apiFetch } from "./lib/apiFetch";

export const metadata = { title: "Tableau de bord — Admin" };

export default async function AdminDashboardPage() {
  const [users, clients, interventions] = await Promise.all([
    apiFetch("/api/user/stats"),
    apiFetch("/api/client/stats"),
    apiFetch("/api/intervention/stats"),
  ]);

  const cards = [
    { label: "Utilisateurs actifs", value: users.data.actifs },
    { label: "Clients", value: clients.data.total },
    { label: "Interventions ce mois", value: interventions.data.duMois },
    { label: "Interventions terminées", value: interventions.data.parStatut.TERMINEE || 0 },
  ];

  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {cards.map((c) => (
          <div className="card card__body" key={c.label}>
            <p className="text-muted">{c.label}</p>
            <p style={{ fontSize: "var(--fs-600)" }}>{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}