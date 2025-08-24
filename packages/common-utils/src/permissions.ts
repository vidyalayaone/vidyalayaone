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
  }
} as const;

// A flat type of all permission strings
export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

export async function hasPermission(
  prisma: any,
  permission: string,
  user: any
): Promise<boolean> {
  if (!user) return false;

  const role = await prisma.role.findUnique({ where: { id: user.roleId } });
  if (!role) return false;
  
  const permissions: string[] = role.permissions || [];
  return permissions.includes(permission);
}