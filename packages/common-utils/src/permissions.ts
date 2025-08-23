// permissions.ts

export const PERMISSIONS = {
  STUDENT: {
    CREATE: "student.create",
    UPDATE: "student.update",
    DELETE: "student.delete",
    VIEW:   "student.view",
  },
  TEACHER: {
    CREATE: "teacher.create",
    ASSIGN_CLASS: "teacher.assign_class",
    VIEW:   "teacher.view",
  },
  EXAM: {
    CREATE: "exam.create",
    SCHEDULE: "exam.schedule",
    VIEW: "exam.view",
  },
  SCHOOL: {
    CREATE: "school.create",
  }
} as const;

// A flat type of all permission strings
export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];