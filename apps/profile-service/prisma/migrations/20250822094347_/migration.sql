/*
  Warnings:

  - You are about to drop the column `academic_year` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `father_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `guardian_email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `guardian_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `guardian_phone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `guardian_relation` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `medical_info` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `mother_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `roll_number` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `transport_info` on the `students` table. All the data in the column will be lost.
  - The `address` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `department` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `qualification` on the `teachers` table. All the data in the column will be lost.
  - The `address` column on the `teachers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[admission_number,school_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employee_id,school_id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `admission_number` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `admission_date` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `employee_id` on table `teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "students_admission_number_key";

-- DropIndex
DROP INDEX "teachers_employee_id_key";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academic_year",
DROP COLUMN "class",
DROP COLUMN "email",
DROP COLUMN "father_name",
DROP COLUMN "guardian_email",
DROP COLUMN "guardian_name",
DROP COLUMN "guardian_phone",
DROP COLUMN "guardian_relation",
DROP COLUMN "is_active",
DROP COLUMN "medical_info",
DROP COLUMN "middle_name",
DROP COLUMN "mother_name",
DROP COLUMN "phone",
DROP COLUMN "profile_picture",
DROP COLUMN "roll_number",
DROP COLUMN "section",
DROP COLUMN "transport_info",
ADD COLUMN     "category" VARCHAR(50),
ADD COLUMN     "contact_info" JSONB,
ADD COLUMN     "meta_data" JSONB,
ADD COLUMN     "profile_photo" VARCHAR(500),
ADD COLUMN     "religion" VARCHAR(50),
ALTER COLUMN "admission_number" SET NOT NULL,
DROP COLUMN "address",
ADD COLUMN     "address" JSONB,
ALTER COLUMN "admission_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "department",
DROP COLUMN "designation",
DROP COLUMN "email",
DROP COLUMN "emergency_contact",
DROP COLUMN "experience",
DROP COLUMN "is_active",
DROP COLUMN "middle_name",
DROP COLUMN "phone",
DROP COLUMN "profile_picture",
DROP COLUMN "qualification",
ADD COLUMN     "category" VARCHAR(50),
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "meta_data" JSONB,
ADD COLUMN     "qualifications" VARCHAR(255),
ADD COLUMN     "religion" VARCHAR(50),
ADD COLUMN     "subject_ids" TEXT[],
ALTER COLUMN "employee_id" SET NOT NULL,
DROP COLUMN "address",
ADD COLUMN     "address" JSONB;

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "roll_number" VARCHAR(50),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "from_date" TIMESTAMP(3),
    "to_date" TIMESTAMP(3),
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" JSONB,
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "relation" VARCHAR(50),
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_student_id_class_id_section_id_academic_key" ON "student_enrollments"("student_id", "class_id", "section_id", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_student_id_guardian_id_key" ON "student_guardians"("student_id", "guardian_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_number_school_id_key" ON "students"("admission_number", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_employee_id_school_id_key" ON "teachers"("employee_id", "school_id");

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
