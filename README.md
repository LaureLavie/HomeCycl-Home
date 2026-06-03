# HomeCycl'Home

Porteur du projet : Laure Lavie  
Formation : Concepteur Développeur d'Applications spécialisé IA  
Organisme : La Fabrique Numérique Paloise, Pau  
Date de début : Février 2026  
Date de livraison prévue : Août 2026  
Version du document : 1.0  
Date de rédaction : Mars 2026

## Aperçu
HomeCycl'Home est une application de gestion de rendez‑vous pour la réparation et l'entretien de vélos à domicile. Elle permet aux clients de réserver des créneaux, aux techniciens de gérer leurs interventions et aux administrateurs d'organiser les zones, forfaits et produits additionnels.

## Contexte pédagogique
Projet réalisé dans le cadre de la formation "Concepteur Développeur d'Applications" pour valider les compétences du référentiel (développement, architecture, bases de données, tests, déploiement, etc.). Possibilité d'extensions IA non évaluées.

## Objectifs principaux
- Permettre la réservation de créneaux par zone géographique.
- Assigner automatiquement les interventions aux techniciens selon leur secteur et disponibilité.
- Gérer comptes clients, techniciens et administrateurs.
- Gérer catalogues de forfaits et produits additionnels.
- Fournir un historique des interventions, photos et paiement.

## Périmètre fonctionnel
- Gestion des utilisateurs (admin, technicien, client)
- Planning/Calendrier par technicien
- Création / modification / annulation d'interventions
- Gestion des forfaits, prix, produits
- Upload de photos pour interventions
- Validation de l'adresse client via service tiers (ex. API de géocodage)

## Rôles et fonctionnalités (synthèse)
- Administrateur : gestion société, utilisateurs, zones, forfaits, produits, planning global.
- Technicien : consulter son planning, marquer interventions comme réalisées, ajouter photos et notes.
- Client : création compte, gestion de ses cycles, réservation et annulation d'interventions, historique.

## Livrables
- Cahier des charges fonctionnel et technique
- Maquettes UI / UX
- Modélisation de la base de données
- API backend (REST)
- Application frontend (web / responsive)
- Tests unitaires et fonctionnels
- Infrastructure (VPS / IAAS ou conteneurisée)
- Pipeline CI/CD et documentation de déploiement

## Architecture technique (suggestion)
- Backend : Node.js + Express (REST API)
- Base de données : PostgreSQL (relationnelle)
- ORM/accès données : TypeORM / Sequelize / Knex (au choix)
- Stockage fichiers : système de fichiers ou objet (ex. S3)
- Authentification : JWT + roles
- Frontend : React ou Nextjs
- Conteneurisation : Docker / docker-compose
- CI/CD : GitHub Actions
- Géocodage : API Leaflet

## Données principales (exemples)
- Users (id, nom, email, rôle, zone)
- Technicians (profil, zones, disponibilités)
- Interventions (client_id, technicien_id, adresse, forfait, statut, photos, date_heure, durée, prix)
- Forfaits (durée_estimee, prix, description)
- Produits (référence, nom, prix, stock)
- Zones géographiques (polygones / codes postaux)

## Flux utilisateur résumé
1. Client entre adresse ou se connecte (suggérée si déjà enregistrée).
2. Choisit cycle et opération (forfait).
3. Sélectionne créneau disponible selon zone et durée du forfait.
4. Confirme et crée compte si nécessaire.
5. Technicien réalise l'intervention, prend photos, ajoute notes et clôture la prestation.
6. Paiement final et mise à jour de l'historique client.

## Développement local (guides rapides)
1. Cloner le dépôt :
   - git clone <URL>
   - cd projetHCH
2. Installer dépendances :
   - npm install
3. Copier le fichier d'environnement :
   - cp .env.example .env
   - Éditer .env (DB, clés API, JWT_SECRET)
4. Préparer la base :
   - Démarrer PostgreSQL (ou docker-compose up -d)
   - Exécuter les migrations avec l'outil choisi 
5. Lancer l'application en développement :
   - npm run dev
6. Tests :
   - npm test

(Remplacer les commandes de migration/exécution selon l'ORM et les scripts présents.)

## Plan indicatif (févr. - août 2026)
- Février–Avril : analyse, maquettes, modélisation, cahier des charges
- Avril–Mai : développement backend et base de données, API
- Juin : frontend, intégration, tests
- Juillet : déploiement, CI/CD, corrections
- Août : documentation finale, préparation à la présentation/examen

## Tests et qualité
- Tests unitaires pour la logique métier
- Tests d'intégration pour les endpoints API
- Tests fonctionnels pour flux utilisateur
- Analyse statique (ESLint) et formatage (Prettier)

## Déploiement
- Conteneuriser services (Docker)
- Déployer sur VPS / IAAS ou plateforme Cloud
- Mettre en place sauvegardes DB et monitoring
- Pipeline CI/CD pour automatiser builds, tests et déploiement

## Documentation
- Cahier des charges
- Diagrammes (architecture)
- Guides d'installation et d'exploitation
- Manuel utilisateur pour administrateurs/techniciens/clients

## Licence
LICENSE MIT.

---