// front/app/client/velos/page.jsx
import { apiFetch } from "./lib/apiFetch";
import VeloManager from "./VeloManager";

export const metadata = { title: "Mes vélos — Client" };

export default async function VelosPage() {
  const result = await apiFetch("/api/client/velos");
  return (
    <>
      <h1>Mes vélos</h1>
      <VeloManager initialVelos={result.data} />
    </>
  );
}