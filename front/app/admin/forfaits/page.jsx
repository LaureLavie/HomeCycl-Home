// front/app/admin/forfaits/page.jsx
import { apiFetch } from "../../../lib/apiFetch";
import ForfaitManager from "./ForfaitManager";

export const metadata = { title: "Forfaits — Admin" };

export default async function ForfaitsPage() {
  const result = await apiFetch("/api/forfait");
  return (
    <>
      <h1>Forfaits</h1>
      <ForfaitManager initialForfaits={result.data} />
    </>
  );
}