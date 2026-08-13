// CONTACT-01 : Contrôleur — formulaire de contact public
// Compétence CDA : Développer des composants métier
import * as contactService from '../services/contactService.js';
import { createContactSchema } from '../validators/validators.js';

// ─────────────────────────────────────────────
// POST /api/contact — Envoi d'un message (route publique, aucun compte requis)
// ─────────────────────────────────────────────

export const envoyerMessage = async (req, res) => {
  try {
    const parsed = createContactSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const result = await contactService.createMessage(parsed.data);

    // MVP : pas de provider d'emailing branché → traçabilité par log serveur,
    // même logique assumée que pour le lien de réinitialisation de mot de passe.
    // Évolution prod : notifier l'admin (Resend/SendGrid) à chaque nouveau message.
    console.log(`📩 [Contact] Nouveau message de ${parsed.data.email} — sujet : "${parsed.data.sujet}"`);

    return res.status(201).json({
      success: true,
      message: 'Votre message a bien été envoyé. Nous vous répondrons sous 48h ouvrées.',
      data: { id_message: result.id_message },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message. Réessayez ou écrivez-nous directement par email.",
    });
  }
};

// ─────────────────────────────────────────────
// Réservé à une future vue admin (non exposé dans les routes pour l'instant)
// ─────────────────────────────────────────────

export const getAllMessages = async (req, res) => {
  try {
    const result = await contactService.getAllMessages(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};