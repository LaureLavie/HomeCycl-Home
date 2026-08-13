// front/app/contact/page.jsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactForm from "./ContactForm";
import { ClockIcon, PinIcon, MailIcon } from "../components/Icons";

export const metadata = {
  title: "Contact — HomeCycl'Home",
  description: "Contactez Le Cycle Lyonnais pour toute question sur nos interventions à domicile.",
};

// Carte statique (Google Static Maps API) : décorative, pas d'interaction
// nécessaire ici — évite de charger le SDK Maps JS complet sur une page
// marketing. Réutilise la même clé que l'autocomplétion d'adresse.
const LYON_LAT = 45.764;
const LYON_LNG = 4.8357;
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${LYON_LAT},${LYON_LNG}&zoom=12&size=640x420&scale=2&style=feature:all|saturation:-100|lightness:10&style=feature:road|element:geometry|color:0xffffff&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}`;

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)" }}>
        <h1>
          Parlons de votre{" "}
          <span style={{ color: "var(--color-primary-accent-dark)" }}>atelier mobile.</span>
        </h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-xl)", maxWidth: "40rem" }}>
          Une question technique ou besoin d&apos;un devis spécifique ? Notre
          atelier se déplace jusqu&apos;à vous, mais la discussion commence ici.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-lg)", alignItems: "start" }} className="contact-grid">
          {/* ---------- Colonne formulaire ---------- */}
          <ContactForm />

          {/* ---------- Colonne infos pratiques + carte ---------- */}
          <div className="flex-col" style={{ gap: "var(--space-lg)" }}>
            <div className="contact-sidebar">
              <h3 style={{ color: "var(--color-text-inverse)" }}>Infos Pratiques</h3>
              <hr className="contact-sidebar__divider" />

              <div className="contact-sidebar__row">
                <span className="contact-sidebar__icon"><ClockIcon /></span>
                <div>
                  <p className="contact-sidebar__title">Horaires de l&apos;atelier</p>
                  <p className="contact-sidebar__text">Lundi — Samedi : 08:00 – 19:00</p>
                  <p className="contact-sidebar__text">Service d&apos;urgence disponible le dimanche</p>
                </div>
              </div>

              <div className="contact-sidebar__row">
                <span className="contact-sidebar__icon"><PinIcon /></span>
                <div>
                  <p className="contact-sidebar__title">Zone d&apos;intervention</p>
                  <p className="contact-sidebar__text">
                    Lyon (69001 à 69009), Villeurbanne, Caluire-et-Cuire.
                  </p>
                </div>
              </div>

              <div className="contact-sidebar__row">
                <span className="contact-sidebar__icon"><MailIcon /></span>
                <div>
                  <p className="contact-sidebar__title">Contact direct</p>
                  <p className="contact-sidebar__text">hello@homecyclhome.fr</p>
                  <p className="contact-sidebar__text">04 78 XX XX XX</p>
                </div>
              </div>
            </div>

            <div className="contact-map">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={staticMapUrl} alt="Zone d'intervention HomeCycl'Home à Lyon" />
              ) : (
                <div className="flex-center" style={{ height: "100%", background: "var(--color-secondary-bg)" }}>
                  <p className="text-muted" style={{ fontSize: "var(--fs-100)", padding: "var(--space-md)" }}>
                    Carte indisponible (clé Google Maps non configurée)
                  </p>
                </div>
              )}
              <span className="contact-map__badge">
                <PinIcon size={16} /> Basés à Lyon 01
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}