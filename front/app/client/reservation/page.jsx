// front/app/client/reservation/page.jsx
import { apiFetch } from "./lib/apiFetch";
import ReservationWizard from "./ReservationWizard";

export const metadata = { title: "Réserver — Client" };

export default async function ReservationPage() {
  // Lectures directes en Server Component : forfaits/produits actifs + vélos du client
  const [forfaits, produits, velos, zonesPubliques] = await Promise.all([
    apiFetch("/api/forfait?actif=true"),
    apiFetch("/api/produit?actif=true"),
    apiFetch("/api/client/velos"),
    apiFetch("/api/zone/public"),
  ]);

  return (
    <>
      <h1>Réserver un entretien</h1>
      <ReservationWizard
        forfaits={forfaits.data}
        produits={produits.data}
        velos={velos.data}
        zones={zonesPubliques.data}
      />
    </>
  );
}