// front/app/mentions-legales/page.jsx
// Page PUBLIQUE — Mentions légales + politique de confidentialité RGPD.
// ⚠️ TEMPLATE : les champs [À COMPLÉTER] doivent être renseignés avec les
// informations réelles de l'entreprise avant toute mise en production.
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = { title: "Mentions légales — HomeCycl'Home" };

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)", maxWidth: "48rem" }}>
        <h1>Mentions légales &amp; politique de confidentialité</h1>

        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>1. Éditeur du site</h2>
          <p>
            Le site HomeCycl&apos;Home est édité par Le Cycle Lyonnais, [À COMPLÉTER — forme
            juridique, SIRET], dont le siège social est situé 69001 Lyon, France.
            <br />
            Directeur de la publication : [À COMPLÉTER].
            <br />
            Contact : contact@homecyclhome.fr
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé sur un serveur VPS. La base de données est
            hébergée par Neon (PostgreSQL serverless). [À COMPLÉTER —
            raison sociale et adresse de l&apos;hébergeur VPS].
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>3. Données personnelles (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD — Règlement UE 2016/679), les données collectées lors de
            la création d&apos;un compte ou d&apos;une réservation (nom, prénom,
            email, téléphone, adresse) sont utilisées exclusivement pour :
          </p>
          <ul style={{ marginBottom: "var(--space-md)" }}>
            <li style={{ padding: "var(--space-xxs) 0" }}>La gestion de votre compte client ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>La planification et le suivi des interventions ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>La communication liée à vos réservations.</li>
          </ul>
          <p>
            Ces données ne sont jamais cédées à des tiers à des fins
            commerciales. Elles sont conservées le temps nécessaire à la
            relation contractuelle, puis désactivées (suppression logique)
            conformément à notre politique de conservation.
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>4. Vos droits</h2>
          <p>
            Conformément aux articles 15 à 22 du RGPD, vous disposez d&apos;un
            droit d&apos;accès, de rectification, d&apos;effacement, de
            limitation, d&apos;opposition et de portabilité de vos données.
            Pour exercer ces droits, contactez-nous à l&apos;adresse
            contact@homecyclhome.fr. Vous pouvez également introduire une
            réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>5. Cookies</h2>
          <p>
            Le site utilise un unique cookie technique (<code>hch_token</code>),
            strictement nécessaire à l&apos;authentification. Ce cookie est
            configuré en <code>httpOnly</code> (inaccessible en JavaScript) et
            n&apos;est pas utilisé à des fins de mesure d&apos;audience ou
            publicitaires. Aucun consentement préalable n&apos;est requis pour
            ce type de cookie strictement nécessaire (exemption CNIL).
          </p>
        </section>

        <section>
          <h2>6. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, visuels,
            logo) est la propriété du Cycle Lyonnais, sauf mention contraire,
            et ne peut être reproduit sans autorisation préalable.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}