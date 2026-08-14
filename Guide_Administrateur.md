# 📘 Guide Utilisateur — Administrateur
## HomeCycl'Home

Version : 1.0 — Août 2026  
Application : HomeCycl'Home  
Rôle concerné : **Administrateur**

---

## Table des matières

1. [Accès et authentification](#1-accès-et-authentification)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Gestion des utilisateurs](#3-gestion-des-utilisateurs)
4. [Gestion des clients](#4-gestion-des-clients)
5. [Gestion des techniciens](#5-gestion-des-techniciens)
6. [Gestion des zones géographiques](#6-gestion-des-zones-géographiques)
7. [Assignation des zones aux techniciens](#7-assignation-des-zones-aux-techniciens)
8. [Gestion des forfaits](#8-gestion-des-forfaits)
9. [Gestion des produits additionnels](#9-gestion-des-produits-additionnels)
10. [Gestion des modèles de planification](#10-gestion-des-modèles-de-planification)
11. [Gestion du planning global](#11-gestion-du-planning-global)
12. [Gestion des interventions](#12-gestion-des-interventions)
13. [Informations de la société](#13-informations-de-la-société)
14. [Déconnexion](#14-déconnexion)

---

## 1. Accès et authentification

### 1.1 Accéder à l'application

Ouvrez votre navigateur et saisissez l'adresse de l'application :

```
http://<adresse_du_serveur>:3000
```

### 1.2 Se connecter

1. Sur la page d'accueil, cliquez sur **"Se connecter"**.
2. Saisissez votre **adresse e-mail** et votre **mot de passe**.
3. Cliquez sur **"Connexion"**.

> Le système vérifie votre rôle. Si votre compte est de type `ADMIN`, vous êtes redirigé automatiquement vers le **tableau de bord administrateur**.

```
Email    : admin@homecyclhome.fr
Mot de passe : (votre mot de passe)
```

### 1.3 Mot de passe oublié

1. Sur la page de connexion, cliquez sur **"Mot de passe oublié"**.
2. Saisissez votre adresse e-mail.
3. Un lien de réinitialisation est envoyé à votre adresse.
4. Cliquez sur le lien reçu et saisissez un nouveau mot de passe.

> Le lien de réinitialisation est valable **1 heure**.

---

## 2. Tableau de bord

Après connexion, le tableau de bord affiche une synthèse en temps réel :

| Bloc | Contenu |
|---|---|
| 📅 **Interventions du jour** | Nombre et liste des interventions planifiées aujourd'hui |
| 🔧 **Interventions en attente** | Réservations non encore assignées à un technicien |
| 👥 **Clients actifs** | Nombre total de clients inscrits |
| 🚴 **Techniciens disponibles** | Techniciens actifs avec leur zone |
| 📦 **Stocks faibles** | Produits dont le stock est en dessous du seuil |
| 📈 **Activité récente** | Dernières interventions créées ou modifiées |

Depuis le tableau de bord, vous accédez à toutes les sections via le **menu latéral gauche**.

---

## 3. Gestion des utilisateurs

### 3.1 Lister les utilisateurs

1. Dans le menu, cliquez sur **"Utilisateurs"**.
2. La liste affiche tous les comptes : admins, techniciens et clients.
3. Utilisez les **filtres** (rôle, statut actif/inactif, recherche par nom ou e-mail) pour affiner.

### 3.2 Créer un utilisateur

1. Cliquez sur **"+ Nouvel utilisateur"**.
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| E-mail | ✅ | Adresse unique dans le système |
| Mot de passe | ✅ | Min. 8 caractères, 1 majuscule, 1 chiffre |
| Rôle | ✅ | `ADMIN`, `TECHNICIEN` ou `CLIENT` |
| Nom | ✅ | Nom de famille |
| Prénom | ✅ (hors admin) | Prénom |
| Téléphone | ✅ (technicien) | Numéro de contact |

3. Cliquez sur **"Créer"**.

> Pour un technicien, vous pourrez lui assigner une zone après la création (voir section 7).

### 3.3 Modifier un utilisateur

1. Dans la liste, cliquez sur **l'icône ✏️** à droite de l'utilisateur.
2. Modifiez les champs souhaités.
3. Cliquez sur **"Enregistrer"**.

### 3.4 Désactiver / Réactiver un compte

1. Dans la liste, cliquez sur **l'icône 🔴** pour désactiver ou **🟢** pour réactiver.
2. Confirmez l'action dans la fenêtre de dialogue.

> Un compte désactivé ne peut plus se connecter. Les données sont conservées.

---

## 4. Gestion des clients

### 4.1 Lister les clients

1. Dans le menu, cliquez sur **"Clients"**.
2. La liste affiche : nom, prénom, e-mail, ville, nombre d'interventions.

### 4.2 Consulter le profil d'un client

1. Cliquez sur le **nom du client**.
2. Le profil affiche :
   - Informations personnelles (adresse, téléphone)
   - Liste de ses vélos
   - Historique de ses interventions

### 4.3 Modifier un client

1. Sur le profil, cliquez sur **"Modifier"**.
2. Modifiez les informations souhaitées.
3. Si l'adresse est modifiée, l'application propose une **validation automatique via Google Maps**.
4. Cliquez sur **"Enregistrer"**.

### 4.4 Gérer les vélos d'un client

Depuis le profil client, section **"Ses vélos"** :

1. Cliquez sur **"+ Ajouter un vélo"**.
2. Remplissez :

| Champ | Description |
|---|---|
| Marque | Ex : Cube, Specialized, Decathlon |
| Modèle | Ex : Reaction Hybrid Pro 625 |
| Année | Année de fabrication |
| Type | `VAE`, `VTT`, `Urbain`, `Route` |

3. Cliquez sur **"Ajouter"**.

---

## 5. Gestion des techniciens

### 5.1 Lister les techniciens

1. Dans le menu, cliquez sur **"Techniciens"**.
2. Chaque ligne affiche : nom, prénom, téléphone, zones assignées, statut.

### 5.2 Créer un technicien

Voir section **3.2** (créer un utilisateur avec le rôle `TECHNICIEN`).

> Après création, pensez à assigner une ou plusieurs zones au technicien (section 7).

### 5.3 Consulter le profil d'un technicien

1. Cliquez sur le **nom du technicien**.
2. Le profil affiche :
   - Informations de contact
   - Zones assignées
   - Planning de la semaine
   - Historique des interventions réalisées

---

## 6. Gestion des zones géographiques

Les zones permettent de délimiter les secteurs d'intervention sur Lyon. Chaque intervention est associée à une zone, et chaque technicien est assigné à une ou plusieurs zones.

### 6.1 Lister les zones

1. Dans le menu, cliquez sur **"Zones"**.
2. La liste affiche : nom, description, frais de déplacement, techniciens assignés.

### 6.2 Créer une zone

1. Cliquez sur **"+ Nouvelle zone"**.
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | ✅ | Ex : Lyon Centre (1er–2e) |
| Description | ✅ | Ex : Presqu'île, Bellecour, Cordeliers |
| Frais de déplacement | ✅ | Montant en euros ajouté au forfait |

3. Cliquez sur **"Créer"**.

### 6.3 Modifier une zone

1. Dans la liste, cliquez sur **l'icône ✏️**.
2. Modifiez les informations.
3. Cliquez sur **"Enregistrer"**.

### 6.4 Supprimer une zone

1. Cliquez sur **l'icône 🗑️**.
2. Confirmez la suppression.

> ⚠️ Une zone ne peut être supprimée que si aucune intervention active ne lui est associée.

---

## 7. Assignation des zones aux techniciens

### 7.1 Assigner une zone à un technicien

**Méthode A — depuis le profil technicien :**

1. Accédez au profil du technicien (section 5.3).
2. Section **"Zones assignées"**, cliquez sur **"+ Assigner une zone"**.
3. Sélectionnez une zone dans la liste déroulante.
4. Cliquez sur **"Confirmer"**.

**Méthode B — depuis la liste des zones :**

1. Accédez à **"Zones"** (section 6.1).
2. Sur la ligne de la zone souhaitée, cliquez sur **"Gérer les techniciens"**.
3. Cochez les techniciens à assigner.
4. Cliquez sur **"Enregistrer"**.

### 7.2 Retirer une zone d'un technicien

1. Sur le profil du technicien, section **"Zones assignées"**.
2. Cliquez sur **l'icône ✖️** à côté de la zone concernée.
3. Confirmez.

> ⚠️ Un technicien ne peut être retiré d'une zone que s'il n'a pas d'interventions planifiées à venir dans cette zone.

---

## 8. Gestion des forfaits

Les forfaits définissent le type de prestation, sa durée et son prix. Ils déterminent la durée du créneau réservé par le client.

### 8.1 Lister les forfaits

1. Dans le menu, cliquez sur **"Forfaits"**.
2. La liste affiche : nom, durée (en minutes), prix, type de vélo ciblé, statut.

### 8.2 Créer un forfait

1. Cliquez sur **"+ Nouveau forfait"**.
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | ✅ | Ex : Révision Rapide |
| Description | ✅ | Détail des opérations incluses |
| Prix (€) | ✅ | Tarif HT |
| Durée (min) | ✅ | Durée totale de l'intervention |
| Type de vélo | ❌ | Laisser vide si applicable à tous |
| Actif | ✅ | Cocher pour rendre visible aux clients |

3. Cliquez sur **"Créer"**.

### 8.3 Modifier un forfait

1. Cliquez sur **l'icône ✏️** sur la ligne du forfait.
2. Modifiez les informations.
3. Cliquez sur **"Enregistrer"**.

> La modification du prix ou de la durée ne s'applique **pas** aux interventions déjà réservées.

### 8.4 Désactiver un forfait

1. Cliquez sur le **toggle Actif** sur la ligne du forfait.
2. Confirmez.

> Un forfait désactivé n'est plus proposé aux nouveaux clients mais reste visible dans l'historique.

---

## 9. Gestion des produits additionnels

Les produits additionnels peuvent être ajoutés à une intervention (ex. chambre à air, câble de frein, huile).

### 9.1 Lister les produits

1. Dans le menu, cliquez sur **"Produits"**.
2. La liste affiche : nom, description, prix unitaire, statut.

### 9.2 Créer un produit

1. Cliquez sur **"+ Nouveau produit"**.
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | ✅ | Ex : Chambre à air 26" |
| Description | ✅ | Détail du produit |
| Prix unitaire (€) | ✅ | Prix de vente |
| Actif | ✅ | Cocher pour rendre disponible |

3. Cliquez sur **"Créer"**.

### 9.3 Modifier un produit

1. Cliquez sur **l'icône ✏️**.
2. Modifiez les champs.
3. Cliquez sur **"Enregistrer"**.

### 9.4 Désactiver un produit

1. Cliquez sur le **toggle Actif** sur la ligne du produit.

> Un produit désactivé ne peut plus être ajouté aux nouvelles interventions.

---

## 10. Gestion des modèles de planification

Les modèles de planification définissent des **gabarits de disponibilités hebdomadaires** appliqués à un technicien dans une zone. Ils évitent de recréer les créneaux semaine par semaine.

### 10.1 Lister les modèles

1. Dans le menu, cliquez sur **"Modèles de planification"**.
2. La liste affiche : nom, description, plages horaires configurées.

### 10.2 Créer un modèle

1. Cliquez sur **"+ Nouveau modèle"**.
2. Remplissez :

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | ✅ | Ex : Semaine standard matin |
| Description | ❌ | Notes internes |

3. Ajoutez des **plages horaires** :
   - Sélectionnez le **jour de la semaine** (Lundi à Samedi).
   - Saisissez l'**heure de début** et l'**heure de fin**.
   - Cliquez sur **"+ Ajouter la plage"**.
   - Répétez pour chaque jour travaillé.

**Exemple de configuration :**

| Jour | Début | Fin |
|---|---|---|
| Lundi | 08:00 | 12:00 |
| Mardi | 08:00 | 12:00 |
| Mercredi | 14:00 | 18:00 |
| Jeudi | 08:00 | 12:00 |
| Vendredi | 08:00 | 17:00 |

4. Cliquez sur **"Créer le modèle"**.

### 10.3 Appliquer un modèle à un technicien

1. Accédez au profil du technicien.
2. Section **"Planification"**, cliquez sur **"Appliquer un modèle"**.
3. Sélectionnez le modèle souhaité.
4. Choisissez la **période d'application** (date de début, date de fin ou illimité).
5. Cliquez sur **"Appliquer"**.

> L'application génère automatiquement les créneaux disponibles dans le planning du technicien pour la période sélectionnée.

### 10.4 Modifier un modèle

1. Cliquez sur **l'icône ✏️** sur la ligne du modèle.
2. Ajoutez, modifiez ou supprimez des plages horaires.
3. Cliquez sur **"Enregistrer"**.

> La modification d'un modèle ne **recalcule pas** les créneaux déjà générés. Pour mettre à jour le planning, appliquez à nouveau le modèle.

---

## 11. Gestion du planning global

### 11.1 Accéder au planning

1. Dans le menu, cliquez sur **"Planning"**.
2. La vue par défaut est la **semaine courante**, avec un onglet par technicien.

### 11.2 Naviguer dans le planning

| Action | Comment |
|---|---|
| Semaine suivante / précédente | Flèches `<` `>` en haut du calendrier |
| Vue jour / semaine / mois | Boutons en haut à droite |
| Filtrer par technicien | Menu déroulant **"Technicien"** |
| Filtrer par zone | Menu déroulant **"Zone"** |

### 11.3 Créneaux disponibles vs occupés

| Couleur | Signification |
|---|---|
| 🟢 Vert | Créneau disponible |
| 🔵 Bleu | Intervention planifiée |
| 🟠 Orange | Intervention en cours |
| ⚫ Gris | Créneau indisponible / hors plage |
| 🔴 Rouge | Intervention annulée |

### 11.4 Créer un créneau manuellement

1. Cliquez sur une **plage horaire vide** dans le planning d'un technicien.
2. Renseignez :
   - Technicien concerné
   - Zone
   - Date et heure
   - Durée
3. Cliquez sur **"Créer le créneau"**.

### 11.5 Bloquer une indisponibilité

1. Cliquez sur **"+ Indisponibilité"**.
2. Sélectionnez le technicien et la plage horaire concernée.
3. Ajoutez un motif (optionnel).
4. Cliquez sur **"Enregistrer"**.

> Les indisponibilités bloquent les créneaux pour les clients lors de la réservation en ligne.

---

## 12. Gestion des interventions

### 12.1 Lister les interventions

1. Dans le menu, cliquez sur **"Interventions"**.
2. Les filtres disponibles :

| Filtre | Options |
|---|---|
| Statut | Planifiée, En cours, Terminée, Annulée |
| Technicien | Tous ou sélection |
| Zone | Toutes ou sélection |
| Période | Date de début / fin |
| Client | Recherche par nom |

### 12.2 Consulter une intervention

1. Cliquez sur **l'intervention** dans la liste ou le planning.
2. Le détail affiche :

| Section | Contenu |
|---|---|
| **Client** | Nom, adresse, téléphone |
| **Vélo** | Marque, modèle, type |
| **Forfait** | Nom, durée, prix |
| **Technicien** | Nom, zone |
| **Produits** | Liste et quantités |
| **Photos** | Photos avant/après intervention |
| **Notes** | Commentaires du technicien |
| **Montant total** | Forfait + produits + frais de déplacement |

### 12.3 Créer une intervention manuellement

1. Cliquez sur **"+ Nouvelle intervention"**.
2. Remplissez le formulaire en plusieurs étapes :

**Étape 1 — Client et vélo**
- Recherchez un client existant ou créez-en un nouveau.
- Sélectionnez le vélo concerné.

**Étape 2 — Forfait**
- Sélectionnez le forfait souhaité.
- Ajoutez des produits additionnels si besoin.

**Étape 3 — Créneau**
- Sélectionnez la zone en fonction de l'adresse du client.
- Choisissez un créneau disponible dans le planning.
- Le technicien est assigné automatiquement selon la zone.

**Étape 4 — Confirmation**
- Vérifiez le récapitulatif.
- Cliquez sur **"Confirmer l'intervention"**.

### 12.4 Modifier une intervention

1. Sur le détail de l'intervention, cliquez sur **"Modifier"**.
2. Modifiez les informations nécessaires (créneau, technicien, produits…).
3. Cliquez sur **"Enregistrer"**.

> ⚠️ La modification d'un créneau libère l'ancien et en occupe un nouveau. Vérifiez la disponibilité du technicien.

### 12.5 Annuler une intervention

1. Sur le détail de l'intervention, cliquez sur **"Annuler l'intervention"**.
2. Saisissez le motif d'annulation (obligatoire).
3. Confirmez.

> L'annulation libère le créneau et notifie le client et le technicien.

---

## 13. Informations de la société

### 13.1 Accéder aux paramètres société

1. Dans le menu, cliquez sur **"Paramètres"** puis **"Société"**.

### 13.2 Modifier les informations

Remplissez ou mettez à jour les champs :

| Champ | Description |
|---|---|
| Nom de la société | Ex : LeCycleLyonnais / HomeCycl'Home |
| Adresse | Adresse du siège |
| Téléphone | Numéro de contact public |
| E-mail de contact | Affiché sur l'application |
| Site web | URL (optionnel) |
| Logo | Upload d'image (PNG, JPG, max 2 Mo) |
| Mentions légales | Texte libre |
| CGV | Texte libre ou lien |
| Horaires d'ouverture | Plages affichées sur la page d'accueil |

Cliquez sur **"Enregistrer"** pour appliquer les modifications.

---

## 14. Déconnexion

### 14.1 Se déconnecter

1. Cliquez sur votre **nom** ou **avatar** en haut à droite.
2. Cliquez sur **"Se déconnecter"**.
3. Vous êtes redirigé vers la page de connexion.

> La session expire automatiquement après **8 heures** d'inactivité.  
> Le token JWT est invalidé côté client. Pour une sécurité maximale, déconnectez-vous toujours sur un poste partagé.

---

## Annexe A — Récapitulatif des droits administrateur

| Fonctionnalité | Lire | Créer | Modifier | Supprimer |
|---|---|---|---|---|
| Utilisateurs | ✅ | ✅ | ✅ | ✅ (désactivation) |
| Clients | ✅ | ✅ | ✅ | ✅ (désactivation) |
| Techniciens | ✅ | ✅ | ✅ | ✅ (désactivation) |
| Zones | ✅ | ✅ | ✅ | ✅ |
| Forfaits | ✅ | ✅ | ✅ | ✅ (désactivation) |
| Produits | ✅ | ✅ | ✅ | ✅ (désactivation) |
| Modèles planification | ✅ | ✅ | ✅ | ✅ |
| Planning | ✅ | ✅ | ✅ | ✅ |
| Interventions | ✅ | ✅ | ✅ | ✅ (annulation) |
| Paramètres société | ✅ | — | ✅ | — |

---

## Annexe B — Codes couleur des statuts d'intervention

| Couleur | Statut | Description |
|---|---|---|
| 🟡 Jaune | `EN_ATTENTE` | Réservée, technicien non encore assigné |
| 🔵 Bleu | `PLANIFIEE` | Technicien assigné, créneau confirmé |
| 🟠 Orange | `EN_COURS` | Technicien en intervention |
| 🟢 Vert | `TERMINEE` | Intervention clôturée et payée |
| 🔴 Rouge | `ANNULEE` | Intervention annulée |

---

## Annexe C — Contacts support

| Besoin | Contact |
|---|---|
| Problème technique application | admin@homecyclhome.fr |
| Réinitialisation mot de passe | Formulaire "Mot de passe oublié" |
| Anomalie base de données | Équipe technique interne |