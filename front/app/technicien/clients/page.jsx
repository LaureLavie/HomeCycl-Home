// front/app/technicien/clients/page.jsx
import { apiFetch } from "../../../lib/apiFetch";

export const metadata = { title: "Mes clients — Technicien" };

export default async function ClientsTechnicienPage() {
  const result = await apiFetch("/api/technicien/clients");

  return (
    <>
      <h1>Mes clients</h1>
      <p className="text-muted">{result.total} client(s) rattaché(s) à vos interventions</p>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Ville</th>
            <th>Vélos</th>
            <th>Dernières interventions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((c) => (
            <tr key={c.id_client}>
              <td>{c.nom} {c.prenom}</td>
              <td>{c.ville}</td>
              <td>{c.velos.length}</td>
              <td>{c.interventions.length}</td>
              <td>
                <a className="btn btn-sm btn-outline" href={`/technicien/clients/${c.id_client}`}>
                  Détail
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}