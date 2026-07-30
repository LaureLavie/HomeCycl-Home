// front/app/client/layout.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/client/dashboard", label: "Tableau de bord" },
  { href: "/client/reservation", label: "Réserver" },
  { href: "/client/historique", label: "Historique" },
  { href: "/client/velos", label: "Mes vélos" },
  { href: "/client/profil", label: "Mon profil" },
];

export default async function ClientLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CLIENT") {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="logo">HomeCycl&apos;Home</p>
        <nav>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
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