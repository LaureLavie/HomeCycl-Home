// front/app/contact/page.jsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Contact — HomeCycl'Home",
  description: "Contactez Le Cycle Lyonnais pour toute question sur nos interventions à domicile.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)" }}>
        <h1>Nous contacter</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-lg)", maxWidth: "36rem" }}>
          Une question sur nos forfaits, une intervention en cours, ou une
          demande spécifique ? Écrivez-nous, nous répondons sous 48h ouvrées.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", maxWidth: "48rem" }}>
          <div className="card card__body">
            <h3>Par email</h3>
            <p className="text-muted">Le plus rapide pour un suivi de dossier.</p>
            <a href="mailto:contact@homecyclhome.fr" className="btn btn-primary btn-sm" style={{ marginTop: "var(--space-sm)" }}>
              contact@homecyclhome.fr
            </a>
          </div>

          <div className="card card__body">
            <h3>Zone d&apos;intervention</h3>
            <p>69001 Lyon, France</p>
            <p className="text-muted">Horaires : Lun–Sam 8h–19h</p>
          </div>

          <div className="card card__body">
            <h3>Une réparation à planifier ?</h3>
            <p className="text-muted">Passez directement par notre tunnel de réservation en ligne.</p>
            <Link href="/reservation" className="btn btn-outline btn-sm" style={{ marginTop: "var(--space-sm)" }}>
              Réserver un entretien
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}