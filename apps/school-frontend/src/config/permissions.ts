// Permission constants for navigation and access control

export const PERMISSIONS = {
  // Student Management
  STUDENT: {
    VIEW: 'student.view',
    CREATE: 'student.create',
    UPDATE: 'student.update',
    DELETE: 'student.delete',
    VIEW_DETAILS: 'student.view_details',
    MANAGE_ENROLLMENT: 'student.manage_enrollment',
  },
  
  // Teacher Management
  TEACHER: {
    VIEW: 'teacher.view',
    CREATE: 'teacher.create',
    UPDATE: 'teacher.update',
    DELETE: 'teacher.delete',
    VIEW_DETAILS: 'teacher.view_details',
    ASSIGN_CLASS: 'teacher.assign_class',
    MANAGE_SCHEDULE: 'teacher.manage_schedule',
  },
  
  // Class Management
  CLASS: {
    VIEW: 'class.view',
    CREATE: 'class.create',
    UPDATE: 'class.update',
    DELETE: 'class.delete',
    MANAGE_SECTIONS: 'class.manage_sections',
    VIEW_TIMETABLE: 'class.view_timetable',
    MANAGE_TIMETABLE: 'class.manage_timetable',
  },
  
  // Subject Management
  SUBJECT: {
    VIEW: 'subject.view',
    CREATE: 'subject.create',
    UPDATE: 'subject.update',
    DELETE: 'subject.delete',
    ASSIGN_TEACHER: 'subject.assign_teacher',
  },
  
  // Attendance Management
  ATTENDANCE: {
    VIEW: 'attendance.view',
    MARK: 'attendance.mark',
    EDIT: 'attendance.edit',
    VIEW_REPORTS: 'attendance.view_reports',
    VIEW_OWN: 'attendance.view_own',
  },
  
  // Exam Management
  EXAM: {
    VIEW: 'exam.view',
    CREATE: 'exam.create',
    UPDATE: 'exam.update',
    DELETE: 'exam.delete',
    SCHEDULE: 'exam.schedule',
    GRADE: 'exam.grade',
    VIEW_RESULTS: 'exam.view_results',
    VIEW_OWN_RESULTS: 'exam.view_own_results',
  },
  
  // Academic Calendar
  ACADEMIC_CALENDAR: {
    VIEW: 'academic_calendar.view',
    CREATE: 'academic_calendar.create',
    UPDATE: 'academic_calendar.update',
    DELETE: 'academic_calendar.delete',
  },
  
  // Admission Management
  ADMISSION: {
    VIEW: 'admission.view',
    CREATE: 'admission.create',
    UPDATE: 'admission.update',
    DELETE: 'admission.delete',
    APPROVE: 'admission.approve',
    REJECT: 'admission.reject',
    BULK_IMPORT: 'admission.bulk_import',
  },
  
  // Fee Management
  FEE: {
    VIEW: 'fee.view',
    CREATE: 'fee.create',
    UPDATE: 'fee.update',
    DELETE: 'fee.delete',
    COLLECT: 'fee.collect',
    VIEW_REPORTS: 'fee.view_reports',
    VIEW_OWN: 'fee.view_own',
  },
  
  // Communication
  COMMUNICATION: {
    SEND_ANNOUNCEMENT: 'communication.send_announcement',
    SEND_MESSAGE: 'communication.send_message',
    VIEW_MESSAGES: 'communication.view_messages',
    MANAGE_NOTIFICATIONS: 'communication.manage_notifications',
  },
  
  // Substitute Teacher
  SUBSTITUTE_TEACHER: {
    VIEW: 'substitute_teacher.view',
    ASSIGN: 'substitute_teacher.assign',
    MANAGE: 'substitute_teacher.manage',
  },
  
  // Reports
  REPORT: {
    VIEW_ADMIN: 'report.view_admin',
    VIEW_TEACHER: 'report.view_teacher',
    VIEW_STUDENT: 'report.view_student',
    GENERATE: 'report.generate',
    EXPORT: 'report.export',
  },
  
  // Dashboard
  DASHBOARD: {
    VIEW_ADMIN: 'dashboard.view_admin',
    VIEW_TEACHER: 'dashboard.view_teacher',
    VIEW_STUDENT: 'dashboard.view_student',
  },
  
  // School Management
  SCHOOL: {
    VIEW: 'school.view',
    UPDATE: 'school.update',
    MANAGE_SETTINGS: 'school.manage_settings',
    VIEW_ANALYTICS: 'school.view_analytics',
  },
  
  // Platform Access
  PLATFORM: {
    LOGIN: 'platform.login',
    GET_ME: 'platform.get_me',
  },
} as const;

// Flatten all permissions for easy checking
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce((acc, permissionGroup) => {
  return [...acc, ...Object.values(permissionGroup)];
}, [] as string[]);

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  ADMIN_PERMISSIONS: [
    ...Object.values(PERMISSIONS.STUDENT),
    ...Object.values(PERMISSIONS.TEACHER),
    ...Object.values(PERMISSIONS.CLASS),
    ...Object.values(PERMISSIONS.SUBJECT),
    ...Object.values(PERMISSIONS.ATTENDANCE),
    ...Object.values(PERMISSIONS.EXAM),
    ...Object.values(PERMISSIONS.ACADEMIC_CALENDAR),
    ...Object.values(PERMISSIONS.ADMISSION),
    ...Object.values(PERMISSIONS.FEE),
    ...Object.values(PERMISSIONS.COMMUNICATION),
    ...Object.values(PERMISSIONS.SUBSTITUTE_TEACHER),
    ...Object.values(PERMISSIONS.REPORT),
    PERMISSIONS.DASHBOARD.VIEW_ADMIN,
    ...Object.values(PERMISSIONS.SCHOOL),
  ],
  
  TEACHER_PERMISSIONS: [
    PERMISSIONS.STUDENT.VIEW,
    PERMISSIONS.STUDENT.VIEW_DETAILS,
    PERMISSIONS.CLASS.VIEW,
    PERMISSIONS.CLASS.VIEW_TIMETABLE,
    PERMISSIONS.SUBJECT.VIEW,
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.MARK,
    PERMISSIONS.EXAM.VIEW,
    PERMISSIONS.EXAM.GRADE,
    PERMISSIONS.EXAM.VIEW_RESULTS,
    PERMISSIONS.ACADEMIC_CALENDAR.VIEW,
    PERMISSIONS.COMMUNICATION.SEND_MESSAGE,
    PERMISSIONS.COMMUNICATION.VIEW_MESSAGES,
    PERMISSIONS.REPORT.VIEW_TEACHER,
    PERMISSIONS.DASHBOARD.VIEW_TEACHER,
  ],
  
  STUDENT_PERMISSIONS: [
    PERMISSIONS.CLASS.VIEW,
    PERMISSIONS.CLASS.VIEW_TIMETABLE,
    PERMISSIONS.SUBJECT.VIEW,
    PERMISSIONS.ATTENDANCE.VIEW_OWN,
    PERMISSIONS.EXAM.VIEW_OWN_RESULTS,
    PERMISSIONS.ACADEMIC_CALENDAR.VIEW,
    PERMISSIONS.FEE.VIEW_OWN,
    PERMISSIONS.COMMUNICATION.VIEW_MESSAGES,
    PERMISSIONS.REPORT.VIEW_STUDENT,
    PERMISSIONS.DASHBOARD.VIEW_STUDENT,
  ],
} as const;

// Helper type for permission values
export type Permission = typeof ALL_PERMISSIONS[number];
