// front/app/admin/clients/page.jsx
import { apiFetch } from "./lib/apiFetch";
import ClientTable from "./ClientTable";

export const metadata = { title: "Clients — Admin" };

export default async function ClientsPage({ searchParams }) {
  const params = await searchParams;
  const page = params.page || "1";
  const search = params.search || "";

  const result = await apiFetch(
    `/api/client?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );

  return (
    <>
      <h1>Clients</h1>
      <ClientTable initialData={result.data} pagination={result.pagination} initialSearch={search} />
    </>
  );
}