// Page PUBLIQUE — Conditions Générales de Vente
// ⚠️ TEMPLATE : les champs [À COMPLÉTER] doivent être renseignés avec les
// informations réelles de l'entreprise avant toute mise en production.
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = { title: "Conditions Générales de Vente — HomeCycl'Home" };

export default function CGVPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingBlock: "var(--space-xl)", maxWidth: "48rem" }}>
        <h1>Conditions Générales de Vente</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-lg)" }}>
          Dernière mise à jour : août 2026
        </p>

        {/* ── 1. Objet ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent l&apos;ensemble
            des prestations de réparation et d&apos;entretien de vélos à domicile
            proposées par la société Le Cycle Lyonnais (ci-après &laquo;&nbsp;le Prestataire&nbsp;&raquo;)
            via l&apos;application HomeCycl&apos;Home, accessible à l&apos;adresse{" "}
            <strong>homecyclhome.fr</strong>.
          </p>
          <p>
            Toute réservation effectuée sur la plateforme implique l&apos;acceptation
            pleine et entière des présentes CGV par le client (ci-après
            &laquo;&nbsp;le Client&nbsp;&raquo;).
          </p>
        </section>

        {/* ── 2. Prestataire ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>2. Prestataire</h2>
          <p>
            Le Cycle Lyonnais — [À COMPLÉTER : forme juridique, capital social,
            SIRET, numéro TVA intracommunautaire]
            <br />
            Siège social : [À COMPLÉTER — adresse complète], 69001 Lyon, France.
            <br />
            E-mail : contact@homecyclhome.fr
            <br />
            Téléphone : [À COMPLÉTER]
          </p>
        </section>

        {/* ── 3. Prestations proposées ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>3. Prestations proposées</h2>
          <p>
            HomeCycl&apos;Home propose des interventions à domicile pour la réparation
            et l&apos;entretien de vélos (VTT, VAE, vélos urbains, vélos de route).
            Les prestations sont regroupées en <strong>forfaits</strong> consultables
            sur la plateforme, auxquels peuvent s&apos;ajouter des{" "}
            <strong>produits additionnels</strong> (pièces détachées, consommables).
          </p>
          <p>
            Chaque forfait précise :
          </p>
          <ul style={{ marginBottom: "var(--space-md)" }}>
            <li style={{ padding: "var(--space-xxs) 0" }}>Le détail des opérations incluses ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>La durée estimée de l&apos;intervention ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>Le prix TTC ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>Le(s) type(s) de vélo compatible(s).</li>
          </ul>
          <p>
            Les interventions sont réalisées dans les <strong>zones géographiques
            définies sur la plateforme</strong>. Des frais de déplacement peuvent
            s&apos;appliquer selon la zone et sont indiqués avant la confirmation
            de la réservation.
          </p>
        </section>

        {/* ── 4. Processus de réservation ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>4. Processus de réservation</h2>
          <p>La réservation s&apos;effectue en plusieurs étapes :</p>
          <ol style={{ marginBottom: "var(--space-md)" }}>
            <li style={{ padding: "var(--space-xxs) 0" }}>
              <strong>Création d&apos;un compte</strong> ou connexion sur
              HomeCycl&apos;Home.
            </li>
            <li style={{ padding: "var(--space-xxs) 0" }}>
              <strong>Ajout du vélo</strong> concerné (marque, modèle, type).
            </li>
            <li style={{ padding: "var(--space-xxs) 0" }}>
              <strong>Sélection d&apos;un forfait</strong> et, le cas échéant,
              de produits additionnels.
            </li>
            <li style={{ padding: "var(--space-xxs) 0" }}>
              <strong>Choix d&apos;un créneau</strong> disponible dans la zone
              correspondant à l&apos;adresse du Client.
            </li>
            <li style={{ padding: "var(--space-xxs) 0" }}>
              <strong>Validation de la commande</strong> : le Client vérifie le
              récapitulatif (prestation, date, adresse, montant total TTC) et
              confirme la réservation.
            </li>
          </ol>
          <p>
            La réservation est considérée comme définitive à réception d&apos;une
            <strong> confirmation par e-mail</strong> adressée au Client.
          </p>
        </section>

        {/* ── 5. Tarifs et paiement ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>5. Tarifs et paiement</h2>
          <p>
            Tous les prix sont indiqués en euros, <strong>toutes taxes comprises (TTC)</strong>.
            Le Prestataire se réserve le droit de modifier ses tarifs à tout moment ;
            les prix applicables sont ceux en vigueur au moment de la confirmation
            de la réservation.
          </p>
          <p>
            Le paiement est exigible <strong>à l&apos;issue de l&apos;intervention</strong>,
            directement auprès du technicien, par les moyens suivants :
          </p>
          <ul style={{ marginBottom: "var(--space-md)" }}>
            <li style={{ padding: "var(--space-xxs) 0" }}>Carte bancaire (terminal mobile) ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>Espèces ;</li>
            <li style={{ padding: "var(--space-xxs) 0" }}>Virement bancaire (sur demande).</li>
          </ul>
          <p>
            Tout retard de paiement entraîne l&apos;application de pénalités de
            retard au taux légal en vigueur, ainsi qu&apos;une indemnité forfaitaire
            pour frais de recouvrement de <strong>40 €</strong> (article L.441-10
            du Code de commerce).
          </p>
        </section>

        {/* ── 6. Annulation et modification ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>6. Annulation et modification</h2>

          <h3 style={{ fontSize: "1rem", marginTop: "var(--space-md)" }}>
            6.1 Annulation par le Client
          </h3>
          <p>
            Le Client peut annuler ou modifier sa réservation via son espace
            personnel, sans frais, jusqu&apos;à <strong>24 heures avant</strong>{" "}
            l&apos;heure du début de l&apos;intervention.
          </p>
          <p>
            En cas d&apos;annulation moins de 24 heures avant l&apos;intervention,
            des <strong>frais d&apos;annulation égaux à 30 % du montant du forfait</strong>{" "}
            pourront être facturés.
          </p>

          <h3 style={{ fontSize: "1rem", marginTop: "var(--space-md)" }}>
            6.2 Annulation par le Prestataire
          </h3>
          <p>
            En cas d&apos;empêchement (maladie du technicien, force majeure), le
            Prestataire s&apos;engage à en informer le Client dans les meilleurs
            délais et à proposer un nouveau créneau. Si aucun accord n&apos;est
            trouvé, aucune somme ne sera due.
          </p>
        </section>

        {/* ── 7. Droit de rétractation ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>7. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L.221-28 du Code de la consommation,
            le droit de rétractation <strong>ne s&apos;applique pas</strong> aux
            prestations de services pleinement exécutées avant la fin du délai
            de rétractation et dont l&apos;exécution a commencé avec l&apos;accord
            préalable exprès du Client.
          </p>
          <p>
            Pour toute réservation dont l&apos;intervention est planifiée à plus de
            14 jours, le Client bénéficie du délai légal de rétractation de
            14 jours à compter de la confirmation de la réservation, sans pénalité.
          </p>
        </section>

        {/* ── 8. Responsabilités ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>8. Responsabilités</h2>

          <h3 style={{ fontSize: "1rem", marginTop: "var(--space-md)" }}>
            8.1 Responsabilité du Prestataire
          </h3>
          <p>
            Le Prestataire s&apos;engage à réaliser les interventions avec soin et
            professionnalisme. Sa responsabilité ne saurait être engagée en cas
            de dommages résultant d&apos;une mauvaise utilisation du vélo par le
            Client après intervention, ou de pièces fournies par le Client.
          </p>

          <h3 style={{ fontSize: "1rem", marginTop: "var(--space-md)" }}>
            8.2 Responsabilité du Client
          </h3>
          <p>
            Le Client s&apos;assure d&apos;être présent ou de désigner un représentant
            lors de l&apos;intervention, et de fournir un accès sécurisé au vélo.
            En cas d&apos;absence non signalée, les frais de déplacement restent
            dus.
          </p>
        </section>

        {/* ── 9. Garanties ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>9. Garanties</h2>
          <p>
            Les prestations réalisées sont garanties <strong>30 jours</strong> à
            compter de la date d&apos;intervention pour les défauts directement
            liés au travail effectué. Cette garantie couvre la main-d&apos;œuvre
            uniquement ; les pièces détachées fournies par le Prestataire
            bénéficient de la garantie légale de conformité (article L.217-4
            du Code de la consommation).
          </p>
        </section>

        {/* ── 10. Données personnelles ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>10. Données personnelles</h2>
          <p>
            Les données personnelles collectées lors de la réservation sont
            traitées conformément à notre{" "}
            <a href="/mentions-legales">politique de confidentialité</a>.
            Elles sont utilisées exclusivement dans le cadre de la gestion
            des prestations et ne sont jamais revendues à des tiers.
          </p>
        </section>

        {/* ── 11. Propriété intellectuelle ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>11. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments de la plateforme HomeCycl&apos;Home (code,
            design, contenus) est protégé par le droit de la propriété
            intellectuelle. Toute reproduction partielle ou totale est
            interdite sans autorisation préalable écrite du Prestataire.
          </p>
        </section>

        {/* ── 12. Loi applicable et litiges ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <h2>12. Loi applicable et règlement des litiges</h2>
          <p>
            Les présentes CGV sont soumises au <strong>droit français</strong>.
            En cas de litige, le Client est invité à contacter le Prestataire
            en priorité à l&apos;adresse contact@homecyclhome.fr afin de rechercher
            une solution amiable.
          </p>
          <p>
            En l&apos;absence de résolution amiable dans un délai de 30 jours,
            le Client consommateur peut recourir à un médiateur de la
            consommation conformément aux articles L.611-1 et suivants du
            Code de la consommation. À défaut, tout litige sera soumis aux
            tribunaux compétents de <strong>Lyon</strong>.
          </p>
        </section>

        {/* ── 13. Modification des CGV ── */}
        <section>
          <h2>13. Modification des CGV</h2>
          <p>
            Le Prestataire se réserve le droit de modifier les présentes CGV
            à tout moment. Les nouvelles conditions seront publiées sur la
            plateforme et s&apos;appliqueront à toute réservation effectuée
            postérieurement à leur mise en ligne.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}