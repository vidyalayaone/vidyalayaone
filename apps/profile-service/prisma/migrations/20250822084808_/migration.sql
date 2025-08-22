-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "qualification" VARCHAR(255),
    "experience" INTEGER,
    "joining_date" TIMESTAMP(3),
    "designation" VARCHAR(100),
    "department" VARCHAR(100),
    "salary" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_picture" VARCHAR(500),
    "emergency_contact" VARCHAR(20),
    "blood_group" VARCHAR(10),
    "marital_status" "MaritalStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "admission_number" VARCHAR(50),
    "roll_number" VARCHAR(50),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "class" VARCHAR(20),
    "section" VARCHAR(10),
    "academic_year" VARCHAR(20),
    "admission_date" TIMESTAMP(3),
    "father_name" VARCHAR(100),
    "mother_name" VARCHAR(100),
    "guardian_name" VARCHAR(100),
    "guardian_phone" VARCHAR(20),
    "guardian_email" VARCHAR(255),
    "guardian_relation" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_picture" VARCHAR(500),
    "blood_group" VARCHAR(10),
    "medical_info" TEXT,
    "transport_info" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_employee_id_key" ON "teachers"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_number_key" ON "students"("admission_number");
