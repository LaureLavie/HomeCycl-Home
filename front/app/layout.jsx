import localFont from "next/font/local";
import "./globals.css";

// Configuration locale pour Kodchasan
const kodchasan = localFont({
  src: [
    {
      path: "../public/fonts/kodchasan-v20-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/kodchasan-v20-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/kodchasan-v20-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-title",
  display: "swap",
});

// Configuration locale pour Syne
const syne = localFont({
  src: [
    {
      path: "../public/fonts/syne-v24-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-v24-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-v24-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-v24-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-v24-latin-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
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