-- CreateEnum
CREATE TYPE "SchoolLevel" AS ENUM ('primary', 'secondary', 'higher_secondary', 'mixed');

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(50) NOT NULL,
    "address" JSONB NOT NULL,
    "school_level" "SchoolLevel" NOT NULL,
    "board" VARCHAR(255),
    "school_code" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
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
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_subdomain_key" ON "schools"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "schools_school_code_key" ON "schools"("school_code");
