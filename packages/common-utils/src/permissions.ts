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
    SEED_ROLES: "school.seed_roles",
    GET: "school.get",
    APPROVE: "school.approve",
  },
  PLATFORM: {
    LOGIN: "platform.login",
    GET_ME: "platform.get_me",
  }
} as const;

// A flat type of all permission strings
export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

export async function hasPermission(
  permission: string,
  user: any
): Promise<boolean> {
  if (!user) return false;
  const permissions: string[] = user.permissions || [];
  return permissions.includes(permission);
}