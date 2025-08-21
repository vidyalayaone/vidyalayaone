/*
  Warnings:

  - You are about to drop the column `schoolId` on the `Subject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_schoolId_fkey";

-- DropIndex
DROP INDEX "Subject_schoolId_code_key";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "schoolId";

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
