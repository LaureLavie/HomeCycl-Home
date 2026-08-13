
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CalendarIcon, BikeIcon, CheckCircleIcon, WrenchIcon } from "./components/Icons";

export const metadata = {
  title: "HomeCycl'Home — Votre vélo entretenu, chez vous",
  description:
    "L'atelier mobile qui redonne vie à votre monture sans que vous ayez à vous déplacer, à Lyon. Expertise artisanale et service premium.",
};

const STEPS = [
  {
    icon: <CalendarIcon />,
    title: "1. Réservez en ligne",
    text: "Choisissez votre prestation et l'horaire qui vous convient via notre calendrier simplifié.",
  },
  {
    icon: <BikeIcon />,
    title: "2. Nous venons à vous",
    text: "Notre technicien arrive à votre domicile ou lieu de travail avec tout l'équipement nécessaire.",
  },
  {
    icon: <CheckCircleIcon />,
    title: "3. Repartez serein",
    text: "Après une intervention soignée, votre vélo est prêt. Vous réglez directement sur place.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* ---------- HERO ---------- */}
        <section
          className="hero"
          style={{ backgroundImage: "url(/images/hero-home.webp)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="container hero__content">
            <h1 className="hero__title">
              Votre vélo entretenu, <mark>chez vous</mark> !
            </h1>
            <p className="hero__lead">
              L&apos;atelier mobile qui redonne vie à votre monture sans que
              vous ayez à vous déplacer dans tout Lyon. Expertise artisanale
              et service premium.
            </p>
            <div className="hero__actions">
              <Link href="/reservation" className="btn btn-primary">
                Prendre Rendez-vous
              </Link>
              <Link href="/forfaits" className="btn btn-light">
                Nos Forfaits
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- COMMENT ÇA MARCHE ---------- */}
        <section className="steps container">
          <h2 className="steps__title">Comment ça marche&nbsp;?</h2>

          <div className="steps__grid">
            {STEPS.map((step) => (
              <div className="step" key={step.title}>
                <span className="step__icon" aria-hidden="true">
                  {step.icon}
                </span>
                <h3>{step.title}</h3>
                <p className="step__text">{step.text}</p>
              </div>
            ))}
          </div>

          <Link href="/reservation" className="btn btn-primary">
            <WrenchIcon />
            Réserver
          </Link>
        </section>

        {/* ---------- VÉLOS ACCEPTÉS ---------- */}
        <section className="container">
          <div className="flex-between" style={{ marginBottom: "var(--space-lg)", flexWrap: "wrap", gap: "var(--space-md)" }}>
            <div>
              <h2>Vélos acceptés</h2>
              <p className="text-muted">
                Nous maîtrisons la mécanique de précision pour tous types de
                montures, de l&apos;urbain au sportif.
              </p>
            </div>
            <Link href="/velos-acceptes" className="btn btn-outline btn-sm btn-uppercase">
                Voir la liste
              </Link>
          </div>

          <div className="bike-grid">
            <article className="card card--media">
              <Image
                src="/images/velo-vae.webp"
                alt="Vélo électrique motorisation Bosch"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
              />
              <div className="card__caption">
                <p className="card__title">Vélos Électriques (VAE)</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--fs-100)" }}>
                  Spécialistes motorisation Bosch, Shimano et Brose.
                </p>
              </div>
            </article>

            <article className="card card--media">
              <Image
                src="/images/velo-urbain.webp"
                alt="Vélos urbains sur porte-vélo"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
              />
              <div className="card__caption">
                <p className="card__title">Urbains &amp; Ville</p>
              </div>
            </article>

            <div className="bike-grid__sub">
              <article className="card card--media">
                <Image
                  src="/images/velo-route.webp"
                  alt="Vélo de route et gravel en montagne"
                  fill
                  sizes="(min-width: 768px) 20vw, 50vw"
                />
                <div className="card__caption">
                  <p className="card__title">Route &amp; Gravel</p>
                </div>
              </article>

              <article className="card card--media">
                <Image
                  src="/images/velo-vtt.webp"
                  alt="VTT, gros plan sur la transmission"
                  fill
                  sizes="(min-width: 768px) 20vw, 50vw"
                />
                <div className="card__caption">
                  <p className="card__title">VTT</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}