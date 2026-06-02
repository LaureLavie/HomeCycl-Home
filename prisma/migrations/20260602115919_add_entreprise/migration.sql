-- CreateTable
CREATE TABLE "entreprise" (
    "id_entreprise" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "siret" VARCHAR(14),
    "adresse" VARCHAR(255),
    "code_postal" VARCHAR(10),
    "ville" VARCHAR(255),
    "telephone" VARCHAR(20),
    "email" VARCHAR(200),
    "site_web" VARCHAR(255),
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entreprise_pkey" PRIMARY KEY ("id_entreprise")
);
