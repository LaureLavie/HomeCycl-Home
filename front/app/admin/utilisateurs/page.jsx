// front/app/admin/utilisateurs/page.jsx
import { apiFetch } from "../../../lib/apiFetch";
import UserTable from "./UserTable";

export const metadata = { title: "Utilisateurs — Admin" };

export default async function UtilisateursPage({ searchParams }) {
  const params = await searchParams;
  const page = params.page || "1";
  const search = params.search || "";

  const result = await apiFetch(
    `/api/user?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );

  return (
    <>
      <h1>Utilisateurs</h1>
      <UserTable initialData={result.data} pagination={result.pagination} />
    </>
  );
}