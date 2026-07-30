// front/app/admin/layout.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/entreprise", label: "Entreprise" },
  { href: "/admin/forfaits", label: "Forfaits" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/zones", label: "Zones" },
  { href: "/admin/planning", label: "Planning" },
];

export default async function AdminLayout({ children }) {
  // Double sécurité : le middleware.js filtre déjà /admin/*,
  // ce contrôle protège aussi le rendu Server Component lui-même (défense en profondeur)
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="logo">HomeCycl&apos;Home — Admin</p>
        <nav>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action="/api/logout" method="post">
          <button type="submit" className="btn btn-outline btn-sm">
            Déconnexion
          </button>
        </form>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}