"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/forfaits", label: "Forfaits" },
  { href: "/reservation", label: "Réserver" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Referme le menu mobile à chaque changement de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="logo">
          HomeCycl&apos;Home
        </Link>

        <nav className="nav" aria-label="Navigation principale">
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav__link${
                    pathname === link.href ? " nav__link--active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex" style={{ gap: "var(--space-sm)", alignItems: "center" }}>
          <Link href="/login" className="btn btn-primary btn-sm">
            Se connecter
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle__bar" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        id="nav-mobile"
        className="nav-mobile"
        data-open={open}
        aria-label="Navigation mobile"
        aria-hidden={!open}
      >
        <ul className="nav-mobile__list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-mobile__link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/login" className="btn btn-primary btn-block">
          Se connecter
        </Link>
      </nav>
    </header>
  );
}