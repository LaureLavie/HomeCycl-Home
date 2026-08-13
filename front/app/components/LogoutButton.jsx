"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService";

// AUTH-07 : Déconnexion — à poser dans les dashboards ADMIN / TECHNICIEN / CLIENT
// Compétence CDA : Développer des composants métier — Sécurité applicative
export default function LogoutButton({ className = "btn btn-outline btn-sm" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    // middleware.js relira l'absence de cookie et bloquera l'accès aux
    // routes protégées ; on redirige explicitement pour l'UX.
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}