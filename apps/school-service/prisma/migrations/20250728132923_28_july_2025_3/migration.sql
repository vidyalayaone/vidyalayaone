/*
  Warnings:

  - You are about to drop the column `tenant_slug` on the `tenants` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tenants_tenant_slug_key";

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "tenant_slug";
