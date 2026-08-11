// front/app/forfaits/page.jsx
// Page PUBLIQUE — catalogue tarifaire consultable sans compte.
// Utilise les routes /api/public/* (jamais protégées par authorize()),
// cohérent avec le tunnel de réservation anonyme (US-21).
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Nos forfaits — HomeCycl'Home",
  description: "Découvrez nos forfaits d'entretien et de réparation de vélos à domicile, à Lyon.",
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function getPublicJson(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Erreur lors du chargement des données");
  }
  return result.data;
}

export default async function ForfaitsPage() {
  const [forfaits, produits] = await Promise.all([
    getPublicJson("/api/public/forfaits"),
    getPublicJson("/api/public/produits"),
  ]);

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)" }}>
        <h1>Nos forfaits</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
          Un technicien se déplace chez vous avec tout l&apos;équipement nécessaire.
          Choisissez le forfait adapté à votre vélo.
        </p>

        {forfaits.length === 0 && (
          <p className="text-muted">Aucun forfait disponible pour le moment.</p>
        )}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginBottom: "var(--space-xl)" }}>
          {forfaits.map((f) => (
            <div className="card card__body" key={f.id_forfait}>
              <div className="flex-between">
                <h3>{f.nom}</h3>
                {f.type_velo && <span className="badge">{f.type_velo}</span>}
              </div>
              {f.description && <p className="card__text">{f.description}</p>}
              <p style={{ fontSize: "var(--fs-500)", fontWeight: 700, marginTop: "var(--space-sm)" }}>
                {f.prix} €
              </p>
              <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
                Durée estimée : {f.duree_minutes} min
              </p>
              <Link href="/reservation" className="btn btn-primary btn-sm btn-block" style={{ marginTop: "var(--space-md)" }}>
                Réserver ce forfait
              </Link>
            </div>
          ))}
        </div>

        {produits.length > 0 && (
          <>
            <h2>Produits additionnels</h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
              À ajouter à votre forfait lors de la réservation.
            </p>
            <ul>
              {produits.map((p) => (
                <li key={p.id_produit} style={{ padding: "var(--space-xs) 0" }}>
                  <strong>{p.nom}</strong> — {p.prix} €
                  {p.description && <span className="text-muted"> · {p.description}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}