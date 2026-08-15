// front/app/forfaits/page.jsx
// Page PUBLIQUE — catalogue tarifaire consultable sans compte.
// Utilise les routes /api/public/* (jamais protégées par authorize()),
// cohérent avec le tunnel de réservation anonyme (US-21).
//
// Layout "bento" (carte simple / carte vedette / carte VAE / carte pièces) :
// entièrement dérivé des données réelles, pas de contenu figé qui casserait
// si un admin ajoute, retire ou renomme un forfait :
//   - "vedette" = le forfait non-VAE le plus cher parmi les 2 moins chers
//     (heuristique simple : le 2e forfait par prix croissant)
//   - "VAE" = tout forfait dont le champ type_velo mentionne VAE/électrique
//   - le reste est affiché dans une grille de secours plus bas, pour ne
//     jamais masquer un forfait créé côté admin
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ShieldCheckIcon, WrenchIcon, CheckCircleIcon, ZapIcon, BatteryIcon, BriefcaseIcon, TimerIcon, HeartCheckIcon } from "../components/Icons";

export const metadata = {
  title: "Nos forfaits — HomeCycl'Home",
  description: "Découvrez nos forfaits d'entretien et de réparation de vélos à domicile, à Lyon.",
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function getPublicJson(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    console.error(`Erreur HTTP ${res.status} sur ${path}`);
    return []; // Valeur de repli pour ne pas casser la page
  }
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Erreur lors du chargement des données");
  }
  return result.data;
}

// Le champ `description` est en TEXT côté back : on affiche une puce par ligne
// si l'admin l'a saisi en multi-lignes, sinon un seul paragraphe.
function toBullets(description) {
  if (!description) return [];
  const lignes = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lignes.length > 1 ? lignes : [];
}

function formatPrix(prix) {
  if (prix === null || prix === undefined) return "Sur devis";
  const n = Number(prix);
  return Number.isInteger(n) ? `${n}€` : `${n.toFixed(2)}€`;
}

const estVae = (f) => Boolean(f.type_velo && /va[e|é]|électr/i.test(f.type_velo));

// Choix de la photo illustrative selon le type de vélo du forfait vedette
function imageForfaitVedette(forfait) {
  const t = (forfait?.type_velo || "").toLowerCase();
  if (t.includes("vtt")) return "/images/velo-vtt.webp";
  if (t.includes("route") || t.includes("gravel")) return "/images/velo-route.webp";
  if (t.includes("ville") || t.includes("urbain")) return "/images/velo-urbain.webp";
  return "/images/velo-route.webp";
}

export default async function ForfaitsPage() {
  const [forfaits, produits] = await Promise.all([
    getPublicJson("/api/public/forfaits"),
    getPublicJson("/api/public/produits"),
  ]);

  const forfaitsVae = forfaits.filter(estVae);
  const forfaitsStandard = forfaits
    .filter((f) => !estVae(f))
    .sort((a, b) => Number(a.prix || 0) - Number(b.prix || 0));

  const simple = forfaitsStandard[0] || null;
  const vedette = forfaitsStandard[1] || null;
  const autresForfaits = forfaitsStandard.slice(2);

  const vaePrincipal = forfaitsVae[0] || null;
  const autresVae = forfaitsVae.slice(1);

  const produitsApercu = produits.slice(0, 3);
  const produitsRestants = produits.length > produitsApercu.length;

  const aucunForfait = forfaits.length === 0;

  return (
    <>
      <Header />
      <main>
        {/* ---------- EN-TÊTE ---------- */}
        <section className="container" style={{ paddingBottom: "var(--space-md)" }}>
          <p
            style={{
              color: "var(--color-primary-accent-dark)",
              fontWeight: 700,
              fontSize: "var(--fs-100)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Entretien à domicile
          </p>
          <h1 style={{ marginTop: "var(--space-xs)", lineHeight: "var(--lh-tight)" }}>
            Nos Forfaits
            <br />
            <span style={{ color: "var(--color-primary-accent-dark)" }}>Sur-Mesure</span>
          </h1>
        </section>

        {aucunForfait && (
          <section className="container">
            <p className="text-muted">Aucun forfait disponible pour le moment. Revenez bientôt !</p>
          </section>
        )}

        {/* ---------- LIGNE 1 : forfait simple + forfait vedette ---------- */}
        {(simple || vedette) && (
          <section className="container" style={{ paddingTop: 0 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "var(--space-lg)",
                alignItems: "stretch",
              }}
            >
              {/* Carte simple */}
              {simple && (
                <div
                  className="card card__body"
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "var(--radius-circle)",
                      background: "color-mix(in srgb, var(--color-primary-accent) 20%, white)",
                      color: "var(--color-primary-accent-dark)",
                    }}
                  >
                    <ShieldCheckIcon size={20} />
                  </span>

                  <div>
                    <h3>{simple.nom}</h3>
                    {toBullets(simple.description).length > 0 ? (
                      <ul style={{ marginTop: "var(--space-sm)", display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                        {toBullets(simple.description).map((ligne) => (
                          <li key={ligne} className="flex" style={{ gap: "var(--space-xs)", alignItems: "flex-start", fontSize: "var(--fs-200)" }}>
                            <CheckCircleIcon size={16} />
                            <span>{ligne}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      simple.description && (
                        <p className="card__text" style={{ marginTop: "var(--space-xs)" }}>{simple.description}</p>
                      )
                    )}
                  </div>

                  <div className="flex-between" style={{ marginTop: "auto", paddingTop: "var(--space-sm)" }}>
                    <div>
                      <p style={{ fontSize: "var(--fs-600)", fontWeight: 700 }}>{formatPrix(simple.prix)}</p>
                      {simple.duree_minutes && (
                        <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>{simple.duree_minutes} min</p>
                      )}
                    </div>
                    <Link href={`/reservation?id_forfait=${simple.id_forfait}`} className="btn btn-outline btn-sm">
                      Réserver
                    </Link>
                  </div>
                </div>
              )}

              {/* Carte vedette */}
              {vedette && (
                <div
                  className="card"
                  style={{
                    background: "color-mix(in srgb, var(--color-secondary-accent) 6%, var(--color-bg-elevated))",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="card__body" style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    <span
                      className="badge"
                      style={{
                        alignSelf: "flex-start",
                        background: "var(--color-neutral-accent)",
                        borderColor: "var(--color-neutral-accent)",
                      }}
                    >
                      Le plus populaire
                    </span>

                    <h3 style={{ fontSize: "var(--fs-500)" }}>{vedette.nom}</h3>
                    {vedette.description && toBullets(vedette.description).length === 0 && (
                      <p className="card__text">{vedette.description}</p>
                    )}

                    {toBullets(vedette.description).length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "var(--space-sm)",
                          marginTop: "var(--space-xs)",
                        }}
                      >
                        {toBullets(vedette.description).map((ligne) => (
                          <span key={ligne} className="flex" style={{ gap: "var(--space-xs)", alignItems: "center", fontSize: "var(--fs-200)", fontWeight: 600 }}>
                            <WrenchIcon size={16} />
                            {ligne}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex-between" style={{ marginTop: "auto", paddingTop: "var(--space-md)" }}>
                      <div>
                        <p style={{ fontSize: "var(--fs-600)", fontWeight: 700 }}>{formatPrix(vedette.prix)}</p>
                        {vedette.duree_minutes && (
                          <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>{vedette.duree_minutes} min</p>
                        )}
                      </div>
                      <Link href={`/reservation?id_forfait=${vedette.id_forfait}`} className="btn btn-primary">
                        Choisir ce forfait
                      </Link>
                    </div>
                  </div>

                  <div style={{ position: "relative", flex: "1 1 220px", minHeight: "16rem" }}>
                    <Image
                      src={imageForfaitVedette(vedette)}
                      alt={vedette.nom}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- LIGNE 2 : VAE + pièces à la carte ---------- */}
        {(vaePrincipal || produits.length > 0) && (
          <section className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "var(--space-lg)",
                alignItems: "stretch",
              }}
            >
              {/* Carte VAE */}
              {vaePrincipal && (
                <div
                  className="card card__body"
                  style={{
                    background: "color-mix(in srgb, var(--color-primary-accent-dark) 55%, #10240f)",
                    color: "var(--color-text-inverse)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-lg)",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: "2 1 240px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "var(--radius-circle)",
                        background: "rgba(255,255,255,0.15)",
                        marginBottom: "var(--space-sm)",
                      }}
                    >
                      <ZapIcon size={20} />
                    </span>
                    <h3 style={{ color: "var(--color-text-inverse)" }}>{vaePrincipal.nom}</h3>
                    <p style={{ color: "rgba(255,255,255,0.85)", marginTop: "var(--space-xs)" }}>
                      {vaePrincipal.description || "Optimisation du système électrique et vérification de l'état de la batterie."}
                    </p>

                    <div className="flex" style={{ gap: "var(--space-md)", alignItems: "center", marginTop: "var(--space-md)" }}>
                      <p style={{ fontSize: "var(--fs-600)", fontWeight: 700 }}>{formatPrix(vaePrincipal.prix)}</p>
                      <Link href={`/reservation?id_forfait=${vaePrincipal.id_forfait}`} className="btn btn-light btn-sm">
                        Prendre RDV
                      </Link>
                    </div>

                    {autresVae.length > 0 && (
                      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--fs-100)", marginTop: "var(--space-md)" }}>
                        + {autresVae.length} autre{autresVae.length > 1 ? "s" : ""} forfait{autresVae.length > 1 ? "s" : ""} VAE :{" "}
                        {autresVae.map((f, i) => (
                          <span key={f.id_forfait}>
                            <Link href={`/reservation?id_forfait=${f.id_forfait}`} style={{ color: "var(--color-text-inverse)", textDecoration: "underline" }}>
                              {f.nom}
                            </Link>
                            {i < autresVae.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      flex: "1 1 140px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-lg)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "var(--space-xs)",
                    }}
                  >
                    <BatteryIcon size={30} />
                    <p style={{ fontSize: "var(--fs-100)", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)" }}>
                      Inclus
                    </p>
                    <p style={{ fontWeight: 700 }}>Rapport Diag</p>
                  </div>
                </div>
              )}

              {/* Carte pièces à la carte */}
              {produits.length > 0 && (
                <div
                  className="card card__body"
                  style={{ background: "color-mix(in srgb, var(--color-neutral-accent) 16%, white)" }}
                  id="tarifs"
                >
                  <h3>Réparation à la carte</h3>
                  <p className="card__text" style={{ marginBottom: "var(--space-md)" }}>
                    Un pneu crevé ? Un câble cassé ? Nous intervenons pour tous types de pannes.
                  </p>

                  <ul style={{ display: "flex", flexDirection: "column" }}>
                    {(produitsRestants ? produits : produitsApercu).map((p, i, arr) => (
                      <li
                        key={p.id_produit}
                        className="flex-between"
                        style={{
                          padding: "var(--space-sm) 0",
                          borderBottom: i < arr.length - 1 ? "1px solid rgba(44,44,44,0.08)" : "none",
                        }}
                      >
                        <span>{p.nom}</span>
                        <strong>{formatPrix(p.prix)}</strong>
                      </li>
                    ))}
                  </ul>

                  <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginTop: "var(--space-sm)", textTransform: "uppercase" }}>
                    Hors coût des pièces détachées
                  </p>

                  <Link href="/reservation" className="btn btn-secondary btn-block" style={{ marginTop: "var(--space-md)" }}>
                    Réserver une réparation →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- Forfaits additionnels (filet de sécurité, jamais rien de masqué) ---------- */}
        {autresForfaits.length > 0 && (
          <section className="container">
            <h2>Autres forfaits</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: "var(--space-md)" }}>
              {autresForfaits.map((f) => (
                <div className="card card__body" key={f.id_forfait}>
                  <div className="flex-between">
                    <h3>{f.nom}</h3>
                    {f.type_velo && <span className="badge">{f.type_velo}</span>}
                  </div>
                  {f.description && <p className="card__text">{f.description}</p>}
                  <p style={{ fontSize: "var(--fs-500)", fontWeight: 700, marginTop: "var(--space-sm)" }}>
                    {formatPrix(f.prix)}
                  </p>
                  {f.duree_minutes && (
                    <p className="text-muted" style={{ fontSize: "var(--fs-100)" }}>Durée estimée : {f.duree_minutes} min</p>
                  )}
                  <Link href={`/reservation?id_forfait=${f.id_forfait}`} className="btn btn-primary btn-sm btn-block" style={{ marginTop: "var(--space-md)" }}>
                    Réserver ce forfait
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Réassurance ---------- */}
        <section className="container">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", textAlign: "center" }}>
            {[
              { icon: <BriefcaseIcon />, title: "Intervention à domicile", text: "Tout le matériel vient à vous dans notre atelier mobile." },
              { icon: <TimerIcon />, title: "Intervention rapide", text: "Réparations effectuées sous 24h à 48h selon disponibilités." },
              { icon: <HeartCheckIcon />, title: "Service garanti", text: "Toutes nos interventions sont garanties 3 mois." },
            ].map((item) => (
              <div key={item.title} className="flex-col" style={{ alignItems: "center", gap: "var(--space-sm)" }}>
                <span style={{ color: "var(--color-primary-accent-dark)" }}>{item.icon}</span>
                <h3 style={{ fontSize: "var(--fs-400)" }}>{item.title}</h3>
                <p className="text-muted" style={{ fontSize: "var(--fs-200)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}