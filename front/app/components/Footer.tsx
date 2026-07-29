import Link from "next/link";
import { GlobeIcon, ShareIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-grid__title">HomeCycl&apos;Home</p>
            <p style={{ marginBottom: "var(--space-md)" }}>
              Votre partenaire mobilité à Lyon. Nous nous déplaçons pour que
              votre seule préoccupation soit le plaisir de rouler.
            </p>
            <div className="flex" style={{ gap: "var(--space-sm)" }}>
              <Link href="/" aria-label="Site web HomeCycl'Home">
                <GlobeIcon />
              </Link>
              <Link href="/" aria-label="Partager">
                <ShareIcon />
              </Link>
            </div>
          </div>

          <div>
            <p className="footer-grid__title">Informations</p>
            <p>Horaires : Lun–Sam 8h–19h</p>
            <p>69001 Lyon, France</p>
            <p>
              <Link href="/">Instagram</Link>
            </p>
            <p>
              <Link href="/">Facebook</Link>
            </p>
          </div>

          <div>
            <p className="footer-grid__title">Newsletter</p>
            <p style={{ marginBottom: "var(--space-sm)" }}>
              Recevez nos conseils d&apos;entretien et offres exclusives.
            </p>
            {/*
              Formulaire volontairement non branché : aucun endpoint
              /api/newsletter n'existe encore côté back (hors périmètre EPIC 1-4).
              À raccorder lors d'un futur sprint si l'US est priorisée.
            */}
            <form
              className="footer-newsletter"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse email
              </label>
              <input
                id="newsletter-email"
                type="email"
                className="form-input"
                placeholder="Votre email"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Ok
              </button>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          © {new Date().getFullYear()} HomeCycl&apos;Home Lyon. L&apos;artisan
          du vélo mobile.
        </div>
      </div>
    </footer>
  );
}