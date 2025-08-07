/*
  Warnings:

  - You are about to drop the `custom_domains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SchoolLevel" AS ENUM ('primary', 'secondary', 'higher_secondary', 'mixed');

-- DropForeignKey
ALTER TABLE "custom_domains" DROP CONSTRAINT "custom_domains_tenant_id_fkey";

-- DropTable
DROP TABLE "custom_domains";

-- DropTable
DROP TABLE "tenants";

-- DropEnum
DROP TYPE "SchoolType";

-- DropEnum
DROP TYPE "SslStatus";

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(50) NOT NULL,
    "address" JSONB NOT NULL,
    "school_level" "SchoolLevel" NOT NULL,
    "board" VARCHAR(255),
    "school_code" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "phone_numbers" TEXT[],
    "email" VARCHAR(255),
    "principal_name" VARCHAR(255),
    "established_year" SMALLINT,
    "language" VARCHAR(50),
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_subdomain_key" ON "schools"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "schools_school_code_key" ON "schools"("school_code");
