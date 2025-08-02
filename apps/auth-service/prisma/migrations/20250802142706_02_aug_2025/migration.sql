/*
  Warnings:

  - You are about to drop the column `attempts` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `otp_code` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `token_value` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locked_until` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `password_history` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `otp` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "password_history" DROP CONSTRAINT "password_history_user_id_fkey";

-- DropIndex
DROP INDEX "refresh_tokens_token_value_key";

-- DropIndex
DROP INDEX "users_username_tenant_id_key";

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "attempts",
DROP COLUMN "otp_code",
ADD COLUMN     "otp" VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "token_value",
ADD COLUMN     "token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "failed_login_attempts",
DROP COLUMN "locked_until",
DROP COLUMN "tenant_id",
ADD COLUMN     "school_id" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "password_history";

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
