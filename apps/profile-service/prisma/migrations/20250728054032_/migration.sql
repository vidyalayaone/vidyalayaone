-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'ALUMNI');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TEACHER', 'STUDENT');

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile_picture" TEXT,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "address" TEXT,
    "subjects" JSONB NOT NULL,
    "classes" JSONB NOT NULL,
    "joining_date" TIMESTAMP(3),
    "employment_type" "EmploymentType",
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile_picture" TEXT,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "address" TEXT,
    "class" INTEGER NOT NULL,
    "section" TEXT,
    "roll_number" TEXT,
    "admission_date" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_size" BIGINT,
    "mime_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teachers_tenant_id_status_idx" ON "teachers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "teachers_tenant_id_classes_idx" ON "teachers"("tenant_id", "classes");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_tenant_id_username_key" ON "teachers"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_tenant_id_email_key" ON "teachers"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_tenant_id_phone_key" ON "teachers"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "students_tenant_id_class_idx" ON "students"("tenant_id", "class");

-- CreateIndex
CREATE INDEX "students_tenant_id_status_idx" ON "students"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_username_key" ON "students"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_email_key" ON "students"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_phone_key" ON "students"("tenant_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_roll_number_class_key" ON "students"("tenant_id", "roll_number", "class");

-- CreateIndex
CREATE INDEX "user_documents_tenant_id_user_id_user_type_idx" ON "user_documents"("tenant_id", "user_id", "user_type");

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "teacher_documents_fkey" FOREIGN KEY ("user_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "student_documents_fkey" FOREIGN KEY ("user_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
