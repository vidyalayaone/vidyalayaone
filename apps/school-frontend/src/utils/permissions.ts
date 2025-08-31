export const PERMISSIONS = {
  STUDENT: {
    CREATE: "student.create",
    UPDATE: "student.update",
    DELETE: "student.delete",
    VIEW: "student.view",
    VIEW_DETAILS: "student.view_details",
    MANAGE_ENROLLMENT: "student.manage_enrollment",
  },
  TEACHER: {
    CREATE: "teacher.create",
    UPDATE: "teacher.update",
    DELETE: "teacher.delete",
    VIEW: "teacher.view",
    VIEW_DETAILS: "teacher.view_details",
    ASSIGN_CLASS: "teacher.assign_class",
    MANAGE_SCHEDULE: "teacher.manage_schedule",
  },
  CLASS: {
    VIEW: "class.view",
    CREATE: "class.create",
    UPDATE: "class.update",
    DELETE: "class.delete",
    MANAGE_SECTIONS: "class.manage_sections",
    VIEW_TIMETABLE: "class.view_timetable",
    MANAGE_TIMETABLE: "class.manage_timetable",
  },
  SECTION: {
    CREATE: "section.create",
    UPDATE: "section.update",
    DELETE: "section.delete",
    VIEW: "section.view",
    ASSIGN_CLASS: "section.assign_class",
    MANAGE_STUDENTS: "section.manage_students",
  },
  SUBJECT: {
    VIEW: "subject.view",
    CREATE: "subject.create",
    UPDATE: "subject.update",
    DELETE: "subject.delete",
    ASSIGN_TEACHER: "subject.assign_teacher",
  },
  ATTENDANCE: {
    VIEW: "attendance.view",
    MARK: "attendance.mark",
    EDIT: "attendance.edit",
    VIEW_REPORTS: "attendance.view_reports",
    VIEW_OWN: "attendance.view_own",
  },
  EXAM: {
    CREATE: "exam.create",
    UPDATE: "exam.update",
    DELETE: "exam.delete",
    SCHEDULE: "exam.schedule",
    VIEW: "exam.view",
    GRADE: "exam.grade",
    VIEW_RESULTS: "exam.view_results",
    VIEW_OWN_RESULTS: "exam.view_own_results",
  },
  ACADEMIC_CALENDAR: {
    VIEW: "academic_calendar.view",
    CREATE: "academic_calendar.create",
    UPDATE: "academic_calendar.update",
    DELETE: "academic_calendar.delete",
  },
  ADMISSION: {
    VIEW: "admission.view",
    CREATE: "admission.create",
    UPDATE: "admission.update",
    DELETE: "admission.delete",
    APPROVE: "admission.approve",
    REJECT: "admission.reject",
    BULK_IMPORT: "admission.bulk_import",
  },
  FEE: {
    VIEW: "fee.view",
    CREATE: "fee.create",
    UPDATE: "fee.update",
    DELETE: "fee.delete",
    COLLECT: "fee.collect",
    VIEW_REPORTS: "fee.view_reports",
    VIEW_OWN: "fee.view_own",
  },
  COMMUNICATION: {
    SEND_ANNOUNCEMENT: "communication.send_announcement",
    SEND_MESSAGE: "communication.send_message",
    VIEW_MESSAGES: "communication.view_messages",
    MANAGE_NOTIFICATIONS: "communication.manage_notifications",
  },
  SUBSTITUTE_TEACHER: {
    VIEW: "substitute_teacher.view",
    ASSIGN: "substitute_teacher.assign",
    MANAGE: "substitute_teacher.manage",
  },
  REPORT: {
    VIEW_ADMIN: "report.view_admin",
    VIEW_TEACHER: "report.view_teacher",
    VIEW_STUDENT: "report.view_student",
    GENERATE: "report.generate",
    EXPORT: "report.export",
  },
  DASHBOARD: {
    VIEW: "dashboard.view",
  },
  SCHOOL: {
    CREATE: "school.create",
    SEED_ROLES: "school.seed_roles",
    GET: "school.get",
    VIEW: "school.view",
    UPDATE: "school.update",
    APPROVE: "school.approve",
    MANAGE_SETTINGS: "school.manage_settings",
    VIEW_ANALYTICS: "school.view_analytics",
  },
  PLATFORM: {
    LOGIN: "platform.login",
    GET_ME: "platform.get_me",
  },
    ME: {
    VIEW: "me.view",
  }
} as const;

// A flat type of all permission strings
export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Flatten all permissions for easy checking
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce((acc, permissionGroup) => {
  return [...acc, ...Object.values(permissionGroup)];
}, [] as string[]);

interface User {
  permissions?: string[];
  [key: string]: unknown;
}

export async function hasPermission(
  permission: string,
  user: User | null
): Promise<boolean> {
  if (!user) return false;
  const permissions: string[] = user.permissions || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(
  requiredPermissions: string[],
  userPermissions: string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(
  requiredPermissions: string[],
  userPermissions: string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

export function checkNavigationAccess(
  requiredPermissions?: string[],
  userPermissions: string[] = []
): boolean {
  // If no required permissions specified, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  return hasAnyPermission(requiredPermissions, userPermissions);
}
