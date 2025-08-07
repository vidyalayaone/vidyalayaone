/*
  Warnings:

  - You are about to drop the column `domain` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the `tenant_configs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenant_slug]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subdomain]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admin_id` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_address` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_type` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subdomain` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_name` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_slug` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('primary', 'secondary', 'higher_secondary', 'mixed');

-- CreateEnum
CREATE TYPE "SslStatus" AS ENUM ('pending', 'active', 'failed');

-- DropForeignKey
ALTER TABLE "tenant_configs" DROP CONSTRAINT "tenant_configs_tenant_id_fkey";

-- DropIndex
DROP INDEX "tenants_domain_idx";

-- DropIndex
DROP INDEX "tenants_domain_key";

-- DropIndex
DROP INDEX "tenants_slug_idx";

-- DropIndex
DROP INDEX "tenants_slug_key";

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "domain",
DROP COLUMN "name",
DROP COLUMN "plan",
DROP COLUMN "slug",
DROP COLUMN "status",
ADD COLUMN     "admin_id" TEXT NOT NULL,
ADD COLUMN     "estimated_student_count" INTEGER,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "school_address" TEXT NOT NULL,
ADD COLUMN     "school_type" "SchoolType" NOT NULL,
ADD COLUMN     "subdomain" VARCHAR(50) NOT NULL,
ADD COLUMN     "tenant_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "tenant_slug" VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE "tenant_configs";

-- DropEnum
DROP TYPE "TenantPlan";

-- DropEnum
DROP TYPE "TenantStatus";

-- CreateTable
CREATE TABLE "custom_domains" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "ssl_status" "SslStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_domains_domain_key" ON "custom_domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenant_slug_key" ON "tenants"("tenant_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- AddForeignKey
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
