// front/app/admin/entreprise/page.jsx
import { apiFetch } from "@/lib/apiFetch";
import EntrepriseForm from "./EntrepriseForm";

export const metadata = { title: "Entreprise — Admin" };

export default async function EntreprisePage() {
  const result = await apiFetch("/api/entreprise");
  return (
    <>
      <h1>Informations entreprise</h1>
      <EntrepriseForm entreprise={result.data} />
    </>
  );
}