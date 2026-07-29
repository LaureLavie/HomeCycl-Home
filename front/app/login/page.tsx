import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "../components/LoginForm";
import { ShieldCheckIcon } from "../components/Icons";

export const metadata: Metadata = {
  title: "Connexion — HomeCycl'Home",
  description:
    "Connectez-vous à votre espace HomeCycl'Home pour gérer vos rendez-vous vélo à domicile à Lyon.",
};

export default function LoginPage() {
  return (
    <main className="auth-split">
      {/* Colonne gauche — visuel + accroche (masquée < 768px) */}
      <section
        className="auth-split__visual"
        style={{ backgroundImage: "url(/images/login-hero.webp)" }}
      >
        <div className="auth-split__visual-content">
          <span className="auth-split__logo">HomeCycl&apos;Home</span>

          <div>
            <h1 className="auth-split__title">
              L&apos;Artisan du Vélo Lyonnais, à votre porte.
            </h1>
            <p className="auth-split__lead">
              Simplifiez l&apos;entretien de votre vélo avec un service de
              qualité, local et passionné. Nous nous déplaçons chez vous.
            </p>
          </div>

          <span className="badge">
            <span className="badge__icon" aria-hidden="true">
              <ShieldCheckIcon />
            </span>
            Entretien vélo garanti
          </span>
        </div>
      </section>

      {/* Colonne droite — formulaire */}
      <section className="auth-split__content">
        <div className="auth-split__form-wrapper">
          <div className="auth-split__form">
            <h2>Bon retour.</h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
              Accédez à votre garage virtuel et vos rendez-vous.
            </p>

            <LoginForm />
          </div>
        </div>

        <footer className="auth-split__footer">
          <Link href="/aide">Aide</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/contact">Contact</Link>
        </footer>
      </section>
    </main>
  );
}