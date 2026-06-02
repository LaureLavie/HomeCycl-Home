-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICIEN', 'CLIENT');

-- CreateTable
CREATE TABLE "authentification" (
    "id_authentification" TEXT NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "mot_passe_hash" VARCHAR(500) NOT NULL,
    "Role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentification_pkey" PRIMARY KEY ("id_authentification")
);

-- CreateTable
CREATE TABLE "client" (
    "id_client" VARCHAR(50) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20),
    "adresse" VARCHAR(255) NOT NULL,
    "code_postal" VARCHAR(10) NOT NULL,
    "ville" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "id_authentification" VARCHAR(50) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "technicien" (
    "id_technicien" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "id_authentification" VARCHAR(50) NOT NULL,

    CONSTRAINT "technicien_pkey" PRIMARY KEY ("id_technicien")
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id_administrateur" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "siret" VARCHAR(14),
    "adresse" VARCHAR(255),
    "code_postal" VARCHAR(10),
    "ville" VARCHAR(255),
    "telephone" VARCHAR(20),
    "email" VARCHAR(200),
    "logo_url" VARCHAR(255),
    "date_modification" TIMESTAMP(3) NOT NULL,
    "id_authentification" VARCHAR(50) NOT NULL,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id_administrateur")
);

-- CreateTable
CREATE TABLE "velo" (
    "id_velo" TEXT NOT NULL,
    "marque" VARCHAR(50) NOT NULL,
    "modele" VARCHAR(100) NOT NULL,
    "annee" INTEGER NOT NULL,
    "type_velo" VARCHAR(100) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_client" VARCHAR(50) NOT NULL,

    CONSTRAINT "velo_pkey" PRIMARY KEY ("id_velo")
);

-- CreateTable
CREATE TABLE "zone" (
    "id_zone" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "geojson" TEXT,
    "frais_deplacement" DECIMAL(8,2),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_pkey" PRIMARY KEY ("id_zone")
);

-- CreateTable
CREATE TABLE "forfait" (
    "id_forfait" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(8,2),
    "duree_minutes" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "type_velo" VARCHAR(100),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forfait_pkey" PRIMARY KEY ("id_forfait")
);

-- CreateTable
CREATE TABLE "produit" (
    "id_produit" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(8,2),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produit_pkey" PRIMARY KEY ("id_produit")
);

-- CreateTable
CREATE TABLE "intervention" (
    "id_intervention" TEXT NOT NULL,
    "date_intervention" TIMESTAMP(3) NOT NULL,
    "heure_debut" TIMESTAMP(3),
    "heure_fin" TIMESTAMP(3),
    "statut" VARCHAR(50) NOT NULL DEFAULT 'PLANIFIEE',
    "adresse_intervention" VARCHAR(255),
    "montant" DECIMAL(10,2),
    "commentaire" TEXT,
    "url_photo" VARCHAR(255),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_zone" VARCHAR(50),
    "id_technicien" VARCHAR(50),
    "id_forfait" VARCHAR(50),
    "id_velo" VARCHAR(50),
    "id_client" VARCHAR(50),

    CONSTRAINT "intervention_pkey" PRIMARY KEY ("id_intervention")
);

-- CreateTable
CREATE TABLE "photo" (
    "id_photo" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "url_photo" VARCHAR(500) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_client" VARCHAR(50),
    "id_intervention" VARCHAR(50),

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id_photo")
);

-- CreateTable
CREATE TABLE "modele_planification" (
    "id_modele_planification" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "duree_pause" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modele_planification_pkey" PRIMARY KEY ("id_modele_planification")
);

-- CreateTable
CREATE TABLE "modele_zone" (
    "id_modele_zone" TEXT NOT NULL,
    "buffer_deplacement" INTEGER NOT NULL,
    "max_intervention_jour" INTEGER NOT NULL,
    "id_zone" VARCHAR(50) NOT NULL,
    "id_modele_planification" VARCHAR(50) NOT NULL,

    CONSTRAINT "modele_zone_pkey" PRIMARY KEY ("id_modele_zone")
);

-- CreateTable
CREATE TABLE "assigner" (
    "id_technicien" VARCHAR(50) NOT NULL,
    "id_modele_planification" VARCHAR(50) NOT NULL,

    CONSTRAINT "assigner_pkey" PRIMARY KEY ("id_technicien","id_modele_planification")
);

-- CreateTable
CREATE TABLE "inclure" (
    "id_intervention" VARCHAR(50) NOT NULL,
    "id_produit" VARCHAR(50) NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "inclure_pkey" PRIMARY KEY ("id_intervention","id_produit")
);

-- CreateIndex
CREATE UNIQUE INDEX "authentification_email_key" ON "authentification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_id_authentification_key" ON "client"("id_authentification");

-- CreateIndex
CREATE UNIQUE INDEX "technicien_id_authentification_key" ON "technicien"("id_authentification");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_id_authentification_key" ON "administrateur"("id_authentification");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_id_authentification_fkey" FOREIGN KEY ("id_authentification") REFERENCES "authentification"("id_authentification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicien" ADD CONSTRAINT "technicien_id_authentification_fkey" FOREIGN KEY ("id_authentification") REFERENCES "authentification"("id_authentification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateur" ADD CONSTRAINT "administrateur_id_authentification_fkey" FOREIGN KEY ("id_authentification") REFERENCES "authentification"("id_authentification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "velo" ADD CONSTRAINT "velo_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_id_zone_fkey" FOREIGN KEY ("id_zone") REFERENCES "zone"("id_zone") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_id_technicien_fkey" FOREIGN KEY ("id_technicien") REFERENCES "technicien"("id_technicien") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_id_forfait_fkey" FOREIGN KEY ("id_forfait") REFERENCES "forfait"("id_forfait") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_id_velo_fkey" FOREIGN KEY ("id_velo") REFERENCES "velo"("id_velo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_id_intervention_fkey" FOREIGN KEY ("id_intervention") REFERENCES "intervention"("id_intervention") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modele_zone" ADD CONSTRAINT "modele_zone_id_zone_fkey" FOREIGN KEY ("id_zone") REFERENCES "zone"("id_zone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modele_zone" ADD CONSTRAINT "modele_zone_id_modele_planification_fkey" FOREIGN KEY ("id_modele_planification") REFERENCES "modele_planification"("id_modele_planification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigner" ADD CONSTRAINT "assigner_id_technicien_fkey" FOREIGN KEY ("id_technicien") REFERENCES "technicien"("id_technicien") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigner" ADD CONSTRAINT "assigner_id_modele_planification_fkey" FOREIGN KEY ("id_modele_planification") REFERENCES "modele_planification"("id_modele_planification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inclure" ADD CONSTRAINT "inclure_id_intervention_fkey" FOREIGN KEY ("id_intervention") REFERENCES "intervention"("id_intervention") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inclure" ADD CONSTRAINT "inclure_id_produit_fkey" FOREIGN KEY ("id_produit") REFERENCES "produit"("id_produit") ON DELETE RESTRICT ON UPDATE CASCADE;
