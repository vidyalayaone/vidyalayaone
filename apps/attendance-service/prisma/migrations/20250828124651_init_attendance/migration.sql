-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'MEDICAL_LEAVE');

-- CreateEnum
CREATE TYPE "TeacherAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY');

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "attendance_taker_id" TEXT NOT NULL,
    "notes" TEXT,
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_attendance" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "TeacherAttendanceStatus" NOT NULL,
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_records_student_id_attendance_date_idx" ON "attendance_records"("student_id", "attendance_date");

-- CreateIndex
CREATE INDEX "attendance_records_class_id_section_id_attendance_date_idx" ON "attendance_records"("class_id", "section_id", "attendance_date");

-- CreateIndex
CREATE INDEX "attendance_records_school_id_attendance_date_idx" ON "attendance_records"("school_id", "attendance_date");

-- CreateIndex
CREATE INDEX "attendance_records_attendance_taker_id_idx" ON "attendance_records"("attendance_taker_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_student_id_attendance_date_key" ON "attendance_records"("student_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_attendance_teacher_id_attendance_date_key" ON "teacher_attendance"("teacher_id", "attendance_date");
