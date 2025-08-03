/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "is_active" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");
