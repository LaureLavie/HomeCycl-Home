// front/app/contact/ContactForm.jsx
"use client";

import { useState } from "react";
import { envoyerMessageContact } from "@/services/contactService";

const SUJETS = [
  "Question générale",
  "Devis pour réparation",
  "Problème avec une intervention",
  "Autre",
];

const FORM_VIDE = { nom: "", email: "", sujet: "", message: "" };

// CONTACT-01 : Formulaire de contact public
// Compétence CDA : Développer des composants métier — Interfaces utilisateur
export default function ContactForm() {
  const [form, setForm] = useState(FORM_VIDE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    setLoading(true);

    try {
      const result = await envoyerMessageContact(form);
      setSuccess(result.message);
      setForm(FORM_VIDE);
    } catch (err) {
      setError(err.message);
      if (err.errors) {
        const mapped = {};
        err.errors.forEach((fe) => { mapped[fe.field] = fe.message; });
        setFieldErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card__body">
      {success && <p className="success-message">{success}</p>}
      {error && <p className="form-error" style={{ marginBottom: "var(--space-md)" }}>{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              name="nom"
              className="form-input"
              placeholder="Jean Dupont"
              value={form.nom}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {fieldErrors.nom && <p className="form-error">{fieldErrors.nom}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="jean@lyon.fr"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sujet">Sujet de votre demande</label>
          <select
            id="sujet"
            name="sujet"
            className="form-input"
            value={form.sujet}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <option value="">— Choisissez un sujet —</option>
            {SUJETS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.sujet && <p className="form-error">{fieldErrors.sujet}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            className="form-input"
            rows={6}
            placeholder="Décrivez l'état de votre vélo ou votre besoin spécifique…"
            value={form.message}
            onChange={handleChange}
            disabled={loading}
            required
          />
          {fieldErrors.message && <p className="form-error">{fieldErrors.message}</p>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Envoi…" : "Envoyer le message ▷"}
        </button>
      </form>
    </div>
  );
}