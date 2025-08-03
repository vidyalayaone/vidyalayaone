/*
  Warnings:

  - You are about to drop the column `school_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "school_id",
ADD COLUMN     "subdomain" TEXT;
