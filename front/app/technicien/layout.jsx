// front/app/technicien/layout.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/technicien/planning", label: "Mon planning" },
  { href: "/technicien/interventions", label: "Mes interventions" },
  { href: "/technicien/clients", label: "Mes clients" },
];

export default async function TechnicienLayout({ children }) {
  const user = await getCurrentUser();
  // ADMIN accepté aussi (les routes back techRouter l'autorisent également)
  if (!user || (user.role !== "TECHNICIEN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="logo">HomeCycl&apos;Home — Technicien</p>
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
          <button type="submit" className="btn btn-outline btn-sm">Déconnexion</button>
        </form>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}