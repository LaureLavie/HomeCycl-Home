/*
  Warnings:

  - You are about to drop the column `adresse` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `code_postal` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `siret` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `telephone` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `ville` on the `administrateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "administrateur" DROP COLUMN "adresse",
DROP COLUMN "code_postal",
DROP COLUMN "logo_url",
DROP COLUMN "siret",
DROP COLUMN "telephone",
DROP COLUMN "ville";
