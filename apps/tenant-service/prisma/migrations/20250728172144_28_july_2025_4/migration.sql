/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminId` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "adminId" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_adminId_key" ON "tenants"("adminId");
