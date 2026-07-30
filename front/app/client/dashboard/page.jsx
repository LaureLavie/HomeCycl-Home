// front/app/client/dashboard/page.jsx
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";

export const metadata = { title: "Tableau de bord — Client" };

export default async function ClientDashboardPage() {
  const profil = await apiFetch("/api/client/profil");

  return (
    <>
      <h1>Bonjour {profil.data.prenom} 👋</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="card card__body">
          <p className="text-muted">Vélos enregistrés</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{profil.data._count.velos}</p>
        </div>
        <div className="card card__body">
          <p className="text-muted">Interventions</p>
          <p style={{ fontSize: "var(--fs-600)" }}>{profil.data._count.interventions}</p>
        </div>
      </div>
      <Link href="/client/reservation" className="btn btn-primary" style={{ marginTop: "var(--space-lg)" }}>
        Réserver un entretien
      </Link>
    </>
  );
}