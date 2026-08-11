import "./globals.css";

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