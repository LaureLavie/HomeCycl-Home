// front/app/velos-acceptes/page.jsx
// Page PUBLIQUE — liste des types de vélos/cycles pris en charge, alimentée
// par l'API publique Bike Index (GET /api/v3/selections/cycle_types).
//
// ⚠️ Note technique : la documentation Bike Index est une SPA JS dont je n'ai
// pas pu observer la réponse JSON réelle en conditions de test. Le parsing
// ci-dessous est donc DÉFENSIF (plusieurs formes de réponse acceptées) avec
// un repli statique si l'appel échoue ou si le format diffère — à vérifier
// en premier lors du déploiement (voir console serveur en cas de repli).
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Vélos acceptés — HomeCycl'Home",
  description: "Types de vélos pris en charge par nos techniciens, à domicile.",
};

// Repli statique si l'API Bike Index est indisponible ou change de format
const TYPES_REPLI = [
  { name: "Vélo urbain / de ville" },
  { name: "Vélo à assistance électrique (VAE)" },
  { name: "Vélo de route" },
  { name: "VTT" },
  { name: "Vélo cargo" },
  { name: "Vélo pliant" },
  { name: "Tandem" },
];

async function getCycleTypes() {
  try {
    const res = await fetch("https://bikeindex.org/api/v3/selections/cycle_types", {
      next: { revalidate: 86400 }, // catalogue stable, 1 revalidation/jour suffit
    });
    if (!res.ok) return null;

    const data = await res.json();
    // La forme exacte de la réponse (clé "cycle_types" vs tableau direct,
    // objets {name, slug} vs paires [slug, name]) n'a pas pu être confirmée
    // sans exécution réelle — on tente plusieurs lectures raisonnables.
    const brut = data.cycle_types || data.selections || (Array.isArray(data) ? data : []);

    const normalise = brut
      .map((item) => {
        if (typeof item === "string") return { name: item };
        if (Array.isArray(item)) return { name: item[1] || item[0] };
        return { name: item.name || item.slug || null };
      })
      .filter((item) => item.name);

    return normalise.length > 0 ? normalise : null;
  } catch {
    return null;
  }
}

export default async function VelosAcceptesPage() {
  const types = (await getCycleTypes()) || TYPES_REPLI;
  const source = types === TYPES_REPLI ? "interne" : "Bike Index";

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)" }}>
        <h1>Vélos acceptés</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-lg)", maxWidth: "40rem" }}>
          Nos techniciens interviennent sur la grande majorité des cycles,
          qu&apos;ils soient musculaires ou à assistance électrique.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {types.map((t) => (
            <div className="card card__body" key={t.name} style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600 }}>{t.name}</p>
            </div>
          ))}
        </div>

        <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginTop: "var(--space-lg)" }}>
          Liste de référence {source === "Bike Index" ? "fournie par " : ""}
          {source === "Bike Index" && (
            <a href="https://bikeindex.org" target="_blank" rel="noopener noreferrer">Bike Index</a>
          )}
          {source === "interne" && "issue de notre catalogue interne (service externe temporairement indisponible)"}
          . Un doute sur votre modèle ? <Link href="/contact">Contactez-nous</Link>.
        </p>
      </main>
      <Footer />
    </>
  );
}