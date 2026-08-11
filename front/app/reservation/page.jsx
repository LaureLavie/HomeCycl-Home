// front/app/reservation/page.jsx
// Page PUBLIQUE — point d'entrée UNIQUE de réservation (US-21).
// Fonctionne pour un visiteur anonyme ET pour un client déjà connecté :
// le catalogue est lu via les routes publiques du backend, les vélos ne
// sont chargés que si un cookie JWT de rôle CLIENT est présent.
import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReservationWizard from "../client/reservation/ReservationWizard";

export const metadata = { title: "Réserver — HomeCycl'Home" };

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function getPublicJson(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Erreur lors du chargement des données");
  }
  return result.data;
}

export default async function ReservationPage() {
  const user = await getCurrentUser();

  const [forfaits, produits, zones] = await Promise.all([
    getPublicJson("/api/public/forfaits"),
    getPublicJson("/api/public/produits"),
    getPublicJson("/api/public/zones"),
  ]);

  let velos = [];
  if (user?.role === "CLIENT") {
    const result = await apiFetch("/api/client/velos");
    velos = result.data;
  }

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)" }}>
        <h1>Réserver un entretien</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
          {user?.role === "CLIENT"
            ? "Choisissez votre créneau, nous nous occupons du reste."
            : "Pas encore de compte ? Vous pourrez en créer un juste après avoir choisi votre créneau."}
        </p>
        <ReservationWizard forfaits={forfaits} produits={produits} velos={velos} zones={zones} />
      </main>
      <Footer />
    </>
  );
}