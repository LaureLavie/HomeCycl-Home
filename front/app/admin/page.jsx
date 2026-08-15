// front/app/admin/page.jsx
// DASH-01 : Tableau de bord administrateur
// Compétence CDA : Développer des composants métier — Interfaces utilisateur
import { apiFetch } from "@/lib/apiFetch";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  SearchIcon,
  BellIcon,
  GearIcon,
  PlusIcon,
  BikeIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "../components/Icons";

export const metadata = { title: "Tableau de bord — Admin" };

function formatEuro(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";
}

function initiales(nom = "", prenom = "") {
  return `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "?";
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [dashboard, monProfil] = await Promise.all([
    apiFetch("/api/dashboard"),
    user?.id ? apiFetch(`/api/user/${user.id}`).catch(() => null) : Promise.resolve(null),
  ]);

  const d = dashboard.data;
  const nomAdmin = monProfil?.data?.administrateur?.nom || "Administrateur";
  const prenomAffiche = nomAdmin.split(" ")[0];

  const dateFormatee = new Date(d.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const progressJour = d.interventionsDuJour.total > 0
    ? Math.round((d.interventionsDuJour.terminees / d.interventionsDuJour.total) * 100)
    : 0;

  return (
    <>
      {/* ---------- Topbar ---------- */}
      <div className="dashboard-topbar">
        <div className="dashboard-search">
          <SearchIcon size={18} />
          <input type="search" placeholder="Search data..." aria-label="Rechercher" />
        </div>

        <div className="flex" style={{ gap: "var(--space-md)", alignItems: "center" }}>
          <button type="button" className="dashboard-icon-btn" aria-label="Notifications">
            <BellIcon size={18} />
            {d.demandesEnAttente.total > 0 && <span className="dashboard-icon-btn__dot" />}
          </button>
          <Link href="/admin/entreprise" className="dashboard-icon-btn" aria-label="Réglages">
            <GearIcon size={18} />
          </Link>
          <div className="dashboard-user">
            <div className="dashboard-user__text">
              <p className="dashboard-user__name">{nomAdmin}</p>
              <p className="dashboard-user__role">ADMINISTRATRICE</p>
            </div>
            <div className="dashboard-user__avatar">{initiales(nomAdmin, "")}</div>
          </div>
        </div>
      </div>

      {/* ---------- En-tête ---------- */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="text-muted">
            Bienvenue {prenomAffiche}. Que se passe-t-il aujourd&apos;hui à Lyon&nbsp;?
          </p>
        </div>
        <span className="dashboard-date-badge">
          <CalendarIcon size={16} /> {dateFormatee}
        </span>
      </div>

      {/* ---------- Cartes stats ---------- */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--green"><BikeIcon size={20} /></span>
          <p className="stat-card__label">Interventions du jour</p>
          <p className="stat-card__value">{d.interventionsDuJour.total}</p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressJour}%` }} />
          </div>
          <p className="stat-card__extra">{d.interventionsDuJour.terminees} / {d.interventionsDuJour.total}</p>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--brown"><BriefcaseIcon size={20} /></span>
          <p className="stat-card__label">Techniciens actifs</p>
          <p className="stat-card__value">{d.techniciensActifs.total}</p>
          <div className="avatar-stack">
            {d.techniciensActifs.apercu.map((t) => (
              <span className="avatar-stack__item" key={t.id_technicien}>
                {initiales(t.nom, t.prenom)}
              </span>
            ))}
            {d.techniciensActifs.total > d.techniciensActifs.apercu.length && (
              <span className="avatar-stack__more">
                +{d.techniciensActifs.total - d.techniciensActifs.apercu.length}
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--green">€</span>
          <p className="stat-card__label">Chiffre d&apos;affaires (mois)</p>
          <p className="stat-card__value">{formatEuro(d.chiffreAffairesMois.total)}</p>
          <p className="stat-card__extra">Objectif mensuel : {formatEuro(d.chiffreAffairesMois.objectif)}</p>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <span className="stat-card__icon stat-card__icon--warning">!</span>
            <span className="badge-urgent">Urgent</span>
          </div>
          <p className="stat-card__label">Demandes en attente</p>
          <p className="stat-card__value">{d.demandesEnAttente.total}</p>
          <p className="stat-card__extra">Moyenne : {d.demandesEnAttente.tempsMoyenHeures}h d&apos;attente</p>
        </div>
      </div>

      {/* ---------- Corps : activités + aside ---------- */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="flex-between" style={{ padding: "var(--space-lg)", paddingBottom: 0 }}>
            <h3>Activités récentes</h3>
            <Link href="/admin/intervention" className="text-muted" style={{ fontSize: "var(--fs-100)" }}>
              Voir tout
            </Link>
          </div>

          <ul className="activity-list">
            {d.activitesRecentes.length === 0 && (
              <li className="text-muted" style={{ padding: "var(--space-lg)" }}>
                Aucune activité récente.
              </li>
            )}
            {d.activitesRecentes.map((a) => (
              <li className="activity-item" key={a.id_intervention}>
                <span className="activity-item__avatar">{a.client?.[0] || "?"}</span>
                <div className="activity-item__content">
                  <p>
                    <strong>{a.client}</strong> {a.action} <strong>{a.libelle}</strong>
                  </p>
                  <p className="activity-item__meta">
                    {new Date(a.date_creation).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {a.ville && ` • ${a.ville}`}
                  </p>
                </div>
                <span className={`badge-status badge-status--${a.badgeCode}`}>{a.badge}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex-col" style={{ gap: "var(--space-lg)" }}>
          <div className="map-card">
            <div>
              <h3 style={{ color: "var(--color-text-inverse)" }}>Localisation Directe</h3>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--fs-100)" }}>
                {d.techniciensActifs.total} technicien(s) en déplacement
              </p>
            </div>
            <div className="map-card__footer">
              <div className="avatar-stack">
                {d.techniciensActifs.apercu.slice(0, 2).map((t) => (
                  <span className="avatar-stack__item avatar-stack__item--light" key={t.id_technicien}>
                    {initiales(t.nom, t.prenom)}
                  </span>
                ))}
              </div>
              <Link href="/admin/planning" className="map-card__badge">Ouvrir la carte</Link>
            </div>
          </div>

          <div className="card card__body">
            <h3>État du stock pièces</h3>
            <p className="text-muted" style={{ fontSize: "var(--fs-100)", marginBottom: "var(--space-md)" }}>
              Données indicatives — le suivi de stock n&apos;est pas encore relié au catalogue produits.
            </p>
            {d.stockPieces.map((p) => (
              <div key={p.nom} className="stock-row">
                <div className="flex-between">
                  <span>{p.nom}</span>
                  <strong>{p.pourcentage}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill${p.pourcentage < 20 ? " progress-fill--low" : ""}`}
                    style={{ width: `${p.pourcentage}%` }}
                  />
                </div>
              </div>
            ))}
            <Link href="/admin/produits" className="btn btn-outline btn-sm btn-block" style={{ marginTop: "var(--space-md)" }}>
              Inventaire complet
            </Link>
          </div>
        </aside>
      </div>

      <Link href="/admin/intervention" className="fab-button" aria-label="Nouvelle intervention">
        <PlusIcon size={22} />
      </Link>
    </>
  );
}