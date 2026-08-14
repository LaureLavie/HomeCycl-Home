# HomeCycl'Home 🚴

Porteur du projet : Laure Lavie  
Formation : Concepteur Développeur d'Applications spécialisé IA  
Organisme : La Fabrique Numérique Paloise, Pau  
Date de début : Février 2026  
Date de livraison prévue : Août 2026  
Version du document : 1.0  
Date de rédaction : Mars 2026

---

## Aperçu

HomeCycl'Home est une application de gestion de rendez‑vous pour la réparation et l'entretien de vélos à domicile.  
Elle permet aux clients de réserver des créneaux, aux techniciens de gérer leurs interventions et aux administrateurs d'organiser les zones, forfaits et produits additionnels.

---

## Contexte pédagogique

Projet réalisé dans le cadre de la formation "Concepteur Développeur d'Applications" pour valider les compétences du référentiel (développement, architecture, bases de données, tests, déploiement, etc.).  
Possibilité d'extensions IA non évaluées.

---

## Objectifs principaux

- Permettre la réservation de créneaux par zone géographique.
- Assigner automatiquement les interventions aux techniciens selon leur secteur et disponibilité.
- Gérer comptes clients, techniciens et administrateurs.
- Gérer catalogues de forfaits et produits additionnels.
- Fournir un historique des interventions, photos et paiement.

---

## Périmètre fonctionnel

- Gestion des utilisateurs (admin, technicien, client)
- Planning / Calendrier par technicien
- Création / modification / annulation d'interventions
- Gestion des forfaits, prix, produits
- Upload de photos pour interventions
- Validation de l'adresse client via service tiers (Google Maps Geocoding)
- Vérification / identification des vélos via Bike Index

---

## Rôles et fonctionnalités (synthèse)

| Rôle | Fonctionnalités |
|---|---|
| **Administrateur** | Gestion société, utilisateurs, zones, forfaits, produits, planning global |
| **Technicien** | Consulter son planning, marquer interventions réalisées, ajouter photos et notes |
| **Client** | Création compte, gestion cycles, réservation / annulation d'interventions, historique |

---

## Architecture logicielle

```
projetHCH/
├── back/                          # API REST Node.js
│   ├── prisma/
│   │   ├── schema.prisma          # Modèle de données Prisma v7
│   │   ├── migrations/            # Migrations SQL versionnées
│   │   └── seed.js                # Données fictives de démarrage
│   ├── src/
│   │   ├── index.js               # Point d'entrée (app.listen)
│   │   ├── controllers/           # Logique métier par domaine
│   │   ├── routes/                # Déclaration des endpoints REST
│   │   ├── middlewares/           # Auth JWT, rôles, upload, erreurs
│   │   ├── services/              # Accès données via Prisma
│   │   ├── utils/                 # JWT, bcrypt, helpers
│   │   └── lib/
│   │       └── prisma.js          # Instance PrismaClient partagée
│   ├── tests/
│   │   ├── unit/                  # Tests unitaires (utils, helpers)
│   │   └── integration/           # Tests API (supertest)
│   ├── prisma.config.js           # Config Prisma v7 (adapter-pg, seed)
│   ├── jest.config.cjs
│   └── package.json
│
├── front/                         # Application Next.js (App Router)
│   ├── app/
│   │   ├── (public)/              # Pages publiques (accueil, réservation)
│   │   ├── (auth)/                # Login, inscription
│   │   ├── (client)/              # Espace client
│   │   ├── (technicien)/          # Espace technicien
│   │   ├── (admin)/               # Back-office admin
│   │   └── api/                   # Route handlers Next.js (BFF)
│   ├── components/                # Composants réutilisables
│   ├── lib/                       # Appels API, hooks, contextes
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # Pipeline CI/CD GitHub Actions
├── docker-compose.yml             # Orchestration multi-conteneurs
└── README.md
```

### Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js 24 + Express 5 |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Base de données | PostgreSQL via Neon (serverless) |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Frontend | Next.js 15 (App Router, React Server Components) |
| Conteneurisation | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Déploiement | VPS OVH Ubuntu |
| Stockage fichiers | Volume Docker `/uploads` |
| Géocodage | Google Maps Geocoding API |
| Calendrier | Cronofy API |
| Identification vélo | Bike Index API |

### Flux de données

```
Client (Next.js)
    │
    ▼
API REST (Express — port 5000)
    │
    ├─► Prisma v7 + adapter-pg
    │       │
    │       ▼
    │   Neon PostgreSQL (cloud)
    │
    ├─► Google Maps API (géocodage adresse)
    ├─► Cronofy API (calendrier techniciens)
    └─► Bike Index API (identification vélos)
```

---

## Installation

### Prérequis

- Node.js >= 20
- npm >= 10
- Docker + docker-compose
- Compte [Neon](https://neon.tech) (base PostgreSQL)
- Clés API : Google Maps, Cronofy, Bike Index

### 1. Cloner le dépôt

```bash
git clone https://github.com/<votre-org>/projetHCH.git
cd projetHCH
```

### 2. Configurer les variables d'environnement

```bash
# Backend
cp back/.env.example back/.env

# Frontend
cp front/.env.example front/.env.local
```

Variables requises dans `back/.env` :

```env
DATABASE_URL=postgresql://user:password@host/homecyclhome?sslmode=require
JWT_SECRET=votre_secret_jwt_fort
PORT=5000
NODE_ENV=development

GOOGLE_MAPS_API_KEY=votre_cle_google
CRONOFY_CLIENT_ID=votre_client_id
CRONOFY_CLIENT_SECRET=votre_client_secret
BIKE_INDEX_API_URL=https://bikeindex.org/api/v3
```

Variables requises dans `front/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_google
```

### 3. Installer les dépendances

```bash
# Backend
cd back && npm install

# Frontend
cd front && npm install
```

### 4. Préparer la base de données

```bash
cd back

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx dotenv -e .env -- npx prisma migrate deploy

# Alimenter avec les données fictives
npx dotenv -e .env -- npx prisma db seed
```

### 5. Lancer en développement

```bash
# Terminal 1 — Backend
cd back && npm run dev

# Terminal 2 — Frontend
cd front && npm run dev
```

L'API est disponible sur `http://localhost:5000`  
Le frontend est disponible sur `http://localhost:3000`

### 6. Lancer avec Docker

```bash
# Depuis la racine du projet
docker-compose up --build
```

---

## Tests

### Structure des tests

```
back/tests/
├── unit/
│   ├── auth.utils.test.js         # Génération / vérification JWT
│   └── creneaux.helpers.test.js   # Calcul des créneaux disponibles
└── integration/
    ├── auth.routes.test.js        # Login, register, token
    ├── forfait.routes.test.js     # CRUD forfaits (admin)
    └── reservation.conflict.test.js # Conflits de créneaux
```

### Lancer les tests

```bash
cd back

# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement (séquentiels)
npm run test:integration

# Avec couverture de code
npm run test:coverage
```

> Les tests d'intégration utilisent la base Neon de test (`.env.test`).  
> La variable `DATABASE_URL` doit pointer sur une base dédiée aux tests.

### Conventions

- Nommage : `E<épique>-TU<n>` (unitaire) / `E<épique>-TI<n>` (intégration)
- Chaque test est isolé (`beforeAll` / `afterAll` avec nettoyage)
- `supertest` pour les appels HTTP en intégration

---

## CI/CD — GitHub Actions

### Pipeline `.github/workflows/deploy.yml`

```
push sur main
      │
      ▼
┌─────────────────────────────┐
│  Job 1 : Build & Push       │
│  - Checkout code            │
│  - Docker Buildx setup      │
│  - Login Docker Hub         │
│  - Build image back         │
│  - Build image front        │
│  - Push lorlaviedevdesign/  │
│    back:sha et :latest      │
│    front:sha et :latest     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Job 2 : Deploy VPS         │
│  (uniquement sur main)      │
│  - SSH vers VPS OVH         │
│  - docker pull images       │
│  - docker-compose up -d     │
└─────────────────────────────┘
```

Le fichier complet de workflow est dans [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Secrets GitHub requis

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Identifiant Docker Hub |
| `DOCKERHUB_TOKEN` | Token Docker Hub (PAT) |
| `VPS_HOST` | IP du VPS OVH |
| `VPS_USER` | Utilisateur SSH (ubuntu) |
| `VPS_SSH_KEY` | Clé privée SSH (OPENSSH) |

---

## Déploiement VPS OVH (sans HTTPS)

### Prérequis sur le VPS

```bash
# Connexion SSH
ssh ubuntu@<IP_VPS>

# Installer Docker
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
```

### Déploiement initial

```bash
# Sur le VPS
mkdir -p /home/ubuntu/homecyclhome
cd /home/ubuntu/homecyclhome

# Créer le fichier .env (copier-coller depuis local)
nano .env

# Copier le docker-compose.yml
nano docker-compose.yml

# Lancer les conteneurs
docker-compose up -d

# Vérifier
docker ps
docker logs homecyclhome_backend
docker logs homecyclhome_frontend
```

### Commandes utiles sur le VPS

```bash
# Voir les logs en temps réel
docker logs -f homecyclhome_backend

# Redémarrer un service
docker-compose restart back

# Mettre à jour manuellement
docker pull lorlaviedevdesign/back:latest
docker pull lorlaviedevdesign/front:latest
docker-compose up -d

# Arrêter tout
docker-compose down
```

> ⚠️ Le déploiement est en HTTP sur les ports `3000` (front) et `5000` (back).  
> L'ajout d'un reverse proxy (Nginx) et HTTPS (Certbot) est prévu en extension.

---

## Documentation API

### Base URL

```
http://<VPS_IP>:5000/api
```

### Authentification

Tous les endpoints protégés nécessitent un header :

```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints principaux

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Créer un compte |
| POST | `/auth/login` | Public | Se connecter, retourne JWT |
| GET | `/forfaits` | Public | Lister les forfaits actifs |
| GET | `/zones` | Public | Lister les zones |
| POST | `/interventions` | CLIENT | Réserver une intervention |
| GET | `/interventions/me` | CLIENT | Mes interventions |
| GET | `/technicien/planning` | TECHNICIEN | Planning du jour / semaine |
| PUT | `/interventions/:id/terminer` | TECHNICIEN | Clôturer une intervention |
| GET | `/admin/users` | ADMIN | Lister les utilisateurs |
| POST | `/admin/forfaits` | ADMIN | Créer un forfait |

---

### API Google Maps Geocoding

Utilisée pour valider et normaliser les adresses des clients.

- **Documentation** : [developers.google.com/maps/documentation/geocoding](https://developers.google.com/maps/documentation/geocoding)
- **Usage dans le projet** : lors de la saisie d'adresse, l'API retourne latitude/longitude stockés avec le profil client et utilisés pour déterminer la zone d'intervention.
- **Variable d'environnement** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (front) / `GOOGLE_MAPS_API_KEY` (back)
- **Endpoint utilisé** :

```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address=<adresse_encodée>
  &key=<API_KEY>
  &language=fr
  &region=fr
```

**Réponse exploitée** :
```json
{
  "results": [{
    "formatted_address": "14 Place Bellecour, 69002 Lyon, France",
    "geometry": {
      "location": { "lat": 45.757814, "lng": 4.832011 }
    }
  }]
}
```

---

### API Cronofy (Calendrier)

Utilisée pour synchroniser et afficher le planning des techniciens.

- **Documentation** : [docs.cronofy.com](https://docs.cronofy.com)
- **Usage dans le projet** : création d'événements lors d'une réservation, lecture du calendrier technicien pour vérifier les disponibilités.
- **Variables d'environnement** : `CRONOFY_CLIENT_ID`, `CRONOFY_CLIENT_SECRET`
- **Endpoints principaux utilisés** :

| Méthode | Endpoint Cronofy | Usage |
|---|---|---|
| POST | `/v1/events` | Créer un événement (réservation confirmée) |
| GET | `/v1/events` | Lire les événements d'un technicien |
| DELETE | `/v1/events` | Supprimer un événement (annulation) |
| POST | `/v1/free_busy` | Vérifier les disponibilités d'un technicien |

**Exemple de création d'événement** :
```json
POST https://api.cronofy.com/v1/events
Authorization: Bearer <CRONOFY_ACCESS_TOKEN>

{
  "event_id": "interv-<id_intervention>",
  "summary": "Révision vélo — Marie Dupont",
  "start": "2026-08-20T09:00:00Z",
  "end": "2026-08-20T10:00:00Z",
  "location": { "description": "14 place Bellecour, 69002 Lyon" }
}
```

---

### API Bike Index

Utilisée pour identifier et vérifier les vélos (marque, modèle, signalement vol éventuel).

- **Documentation** : [bikeindex.org/documentation/api/v3](https://bikeindex.org/documentation/api/v3)
- **Usage dans le projet** : lors de l'ajout d'un vélo par le client, recherche dans la base Bike Index pour pré-remplir marque/modèle et vérifier l'historique.
- **Variable d'environnement** : `BIKE_INDEX_API_URL=https://bikeindex.org/api/v3`
- **Authentification** : clé API en header ou paramètre query (accès public limité)
- **Endpoints utilisés** :

| Méthode | Endpoint | Usage |
|---|---|---|
| GET | `/bikes?serial=<numéro_série>` | Rechercher un vélo par numéro de série |
| GET | `/bikes/<id>` | Détail d'un vélo |
| GET | `/manufacturers` | Liste des fabricants pour autocomplétion |

**Exemple de recherche** :
```
GET https://bikeindex.org/api/v3/bikes?serial=ABC123&per_page=5
```

**Réponse exploitée** :
```json
{
  "bikes": [{
    "id": 12345,
    "title": "Cube Reaction Hybrid Pro 625 2022",
    "manufacturer_name": "Cube",
    "year": 2022,
    "frame_colors": ["Noir"],
    "stolen": false
  }]
}
```

---

## Livrables

- [x] Cahier des charges fonctionnel et technique
- [x] Maquettes UI / UX
- [x] Modélisation de la base de données
- [x] API backend REST (Node.js + Prisma v7)
- [ ] Application frontend (Next.js 15)
- [x] Tests unitaires et d'intégration
- [x] Infrastructure Docker + VPS OVH
- [x] Pipeline CI/CD GitHub Actions
- [ ] Documentation de déploiement complète

---

## Plan indicatif (févr. – août 2026)

| Période | Travaux |
|---|---|
| Février – Avril | Analyse, maquettes, modélisation, cahier des charges |
| Avril – Mai | Backend, base de données, API REST |
| Juin | Frontend Next.js, intégration APIs tierces |
| Juillet | Déploiement, CI/CD, tests, corrections |
| Août | Documentation finale, préparation examen |

---

## Licence

MIT .