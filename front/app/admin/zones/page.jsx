// front/app/admin/zones/page.jsx
import { apiFetch } from "@/lib/apiFetch";
import ZoneManager from "./ZoneManager";

export const metadata = { title: "Zones géographiques — Admin" };

export default async function ZonesPage() {
  const result = await apiFetch("/api/zone");
  return (
    <>
      <h1>Zones géographiques</h1>
      <ZoneManager initialZones={result.data} />
    </>
  );
}