/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_tenant_id_email_key";

-- DropIndex
DROP INDEX "users_tenant_id_username_key";

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "tenant_id",
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "tenant_id",
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tenant_id",
ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_username_key" ON "users"("tenantId", "username");
