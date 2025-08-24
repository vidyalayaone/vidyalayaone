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
  prisma: any,
  permission: string,
  roleId: any
): Promise<boolean> {
  if (!roleId) return false;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return false;

  const permissions: string[] = role.permissions || [];
  return permissions.includes(permission);
}