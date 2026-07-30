// front/app/admin/produits/page.jsx
import { apiFetch } from "../../../lib/apiFetch";
import ProduitManager from "./ProduitManager";

export const metadata = { title: "Produits — Admin" };

export default async function ProduitsPage() {
  const result = await apiFetch("/api/produit");
  return (
    <>
      <h1>Produits additionnels</h1>
      <ProduitManager initialProduits={result.data} />
    </>
  );
}