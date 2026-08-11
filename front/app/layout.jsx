import { Kodchasan, Syne } from "next/font/google";
import "./globals.css";

// Titres, logo, CTA — chargé en 500/600/700 (charte : "Kodchasan Bold")
const kodchasan = Kodchasan({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-title",
  display: "swap",
});

// Corps de texte, menus
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "HomeCycl'Home — L'atelier vélo qui vient chez vous",
  description:
    "Réservez l'entretien et la réparation de votre vélo à domicile, à Lyon. Techniciens qualifiés, forfaits transparents, sans déplacement.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${kodchasan.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}