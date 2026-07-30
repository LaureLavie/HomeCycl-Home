// front/app/client/profil/page.jsx
import { apiFetch } from "./lib/apiFetch";
import ProfilForm from "./ProfilForm";

export const metadata = { title: "Mon profil — Client" };

export default async function ProfilPage() {
  const result = await apiFetch("/api/client/profil");
  return (
    <>
      <h1>Mon profil</h1>
      <ProfilForm profil={result.data} />
    </>
  );
}