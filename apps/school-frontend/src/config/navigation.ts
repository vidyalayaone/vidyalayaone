import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Settings,
  FileText,
  CheckSquare,
  Award,
  Calendar,
  UserCheck,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Bell,
  UserCog,
  UserPlus,
  CalendarCheck,
  PenTool,
  CalendarDays,
  MessageCircle,
  DollarSign,
  // RupeeSign,
  Library,
  Clock,
  type LucideIcon,
  IndianRupee
} from 'lucide-react';

import { PERMISSIONS } from '@/utils/permissions';

export function checkNavigationAccess(
  requiredPermissions?: string[],
  userPermissions: string[] = []
): boolean {
  // If no required permissions specified, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  
  // Check if user has any of the required permissions
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  requiredPermissions?: string[];
  excludedPermissions?: string[];
  children?: NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

// Universal navigation configuration (all possible items)
export const allNavigationItems: NavigationGroup[] = [
  {
    label: 'Main',
    items: [
      {
        path: '/dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard,
        description: 'Overview of school activities and statistics',
        requiredPermissions: []
      },
      {
        path: '/students', 
        label: 'Students', 
        icon: Users,
        description: 'Manage student records and enrollment',
        requiredPermissions: [PERMISSIONS.STUDENT.VIEW]
      },
      {
        path: '/teachers', 
        label: 'Teachers', 
        icon: UserCog,
        description: 'Manage teaching staff and assignments',
        requiredPermissions: [PERMISSIONS.TEACHER.VIEW]
      },
      { 
        path: '/classes', 
        label: 'Classes', 
        icon: BookOpen,
        description: 'Manage class schedules and assignments',
        requiredPermissions: [PERMISSIONS.CLASS.CREATE]
      },
      { 
        path: '/admission', 
        label: 'Admission', 
        icon: UserPlus,
        description: 'Handle new student admissions',
        requiredPermissions: [PERMISSIONS.ADMISSION.VIEW]
      },
    ]
  },
  {
    label: 'Academic',
    items: [
      // { 
        //   path: '/subjects', 
        //   label: 'Subjects', 
      //   icon: BookOpen,
      //   description: 'Manage curriculum subjects',
      //   requiredPermissions: [PERMISSIONS.SUBJECT.VIEW]
      // },
      // {
      //   path: '/assignments', 
      //   label: 'Assignments', 
      //   icon: ClipboardList,
      //   description: 'Create and manage assignments',
      //   requiredPermissions: [PERMISSIONS.EXAM.CREATE] // Using exam permissions as proxy
      // },
      { 
        path: '/attendance/mark', 
        label: 'Mark Attendance', 
        icon: CalendarCheck,
        description: 'Take daily attendance for class sections',
        requiredPermissions: [PERMISSIONS.ATTENDANCE.MARK]
      },
      { 
        path: '/attendance', 
        label: 'Attendance', 
        icon: UserCheck,
        description: 'Track and manage student attendance',
        requiredPermissions: [PERMISSIONS.ATTENDANCE.VIEW]
      },
      { 
        path: '/timetable', 
        label: 'Timetable', 
        icon: Calendar,
        description: 'View and manage class schedules',
        requiredPermissions: [PERMISSIONS.CLASS.VIEW_TIMETABLE]
      },
      { 
        path: '/exam-schedule', 
        label: 'Exam Schedule', 
        icon: PenTool,
        description: 'Schedule and manage examinations',
        requiredPermissions: [PERMISSIONS.EXAM.SCHEDULE]
      },
      { 
        path: '/grades', 
        label: 'Grades', 
        icon: Award,
        description: 'View and manage student grades',
        requiredPermissions: [PERMISSIONS.EXAM.VIEW_RESULTS]
      },
    ]
  },
  {
    label: 'Administrative',
    items: [
      { 
        path: '/fees', 
        label: 'Fees', 
        icon: IndianRupee,
        description: 'Manage student fees and payments',
        requiredPermissions: [PERMISSIONS.FEE.VIEW]
      },
      // { 
      //   path: '/library', 
      //   label: 'Library', 
      //   icon: Library,
      //   description: 'Manage library books and resources',
      //   requiredPermissions: [PERMISSIONS.SCHOOL.VIEW] // Using school permissions as proxy
      // },
      // { 
      //   path: '/events', 
      //   label: 'Events', 
      //   icon: CalendarDays,
      //   description: 'Schedule and manage school events',
      //   requiredPermissions: [PERMISSIONS.ACADEMIC_CALENDAR.VIEW]
      // },
      // { 
      //   path: '/substitute-teacher', 
      //   label: 'Substitute Teacher', 
      //   icon: Clock,
      //   description: 'Manage substitute teacher assignments',
      //   requiredPermissions: [PERMISSIONS.SUBSTITUTE_TEACHER.VIEW]
      // }
    ]
  },
  // {
  //   label: 'Reports & Analytics',
  //   items: [
  //     { 
  //       path: '/reports', 
  //       label: 'Reports', 
  //       icon: FileText,
  //       description: 'Generate and view various reports',
  //       requiredPermissions: [PERMISSIONS.REPORT.VIEW_ADMIN, PERMISSIONS.REPORT.VIEW_TEACHER, PERMISSIONS.REPORT.VIEW_STUDENT]
  //     },
  //     { 
  //       path: '/analytics', 
  //       label: 'Analytics', 
  //       icon: TrendingUp,
  //       description: 'View performance analytics and insights',
  //       requiredPermissions: [PERMISSIONS.REPORT.VIEW_ADMIN] // Using report admin as proxy for analytics
  //     }
  //   ]
  // },
  // {
  //   label: 'Communication',
  //   items: [
  //     { 
  //       path: '/messages', 
  //       label: 'Messages', 
  //       icon: MessageSquare,
  //       description: 'Internal messaging system',
  //       requiredPermissions: [PERMISSIONS.COMMUNICATION.VIEW_MESSAGES]
  //     },
  //     { 
  //       path: '/announcements', 
  //       label: 'Announcements', 
  //       icon: Bell,
  //       description: 'School and class announcements',
  //       requiredPermissions: [PERMISSIONS.COMMUNICATION.SEND_ANNOUNCEMENT, PERMISSIONS.COMMUNICATION.VIEW_MESSAGES]
  //     },
  //     { 
  //       path: '/notifications', 
  //       label: 'Notifications', 
  //       icon: Bell,
  //       description: 'System notifications and alerts',
  //       requiredPermissions: [PERMISSIONS.COMMUNICATION.MANAGE_NOTIFICATIONS]
  //     }
  //   ]
  // },
  {
    label: 'Settings',
    items: [
      // { 
      //   path: '/settings', 
      //   label: 'Settings', 
      //   icon: Settings,
      //   description: 'System and user settings',
      //   requiredPermissions: [PERMISSIONS.SCHOOL.UPDATE] // Using school update as proxy for settings
      // },
      // { 
      //   path: '/user-management', 
      //   label: 'User Management', 
      //   icon: UserCog,
      //   description: 'Manage users and their roles',
      //   requiredPermissions: [PERMISSIONS.TEACHER.VIEW, PERMISSIONS.STUDENT.VIEW] // Can see users if can view teachers/students
      // }
    ]
  }
];

// Helper function to filter navigation items based on permissions only
export function filterNavigationByPermissions(
  groups: NavigationGroup[], 
  userPermissions: string[] = []
): NavigationGroup[] {
  return groups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      checkNavigationAccess(
        item.requiredPermissions,
        userPermissions
      )
    )
  })).filter(group => group.items.length > 0); // Remove empty groups
}

// Helper function to get flat list of navigation items without groups
export function getFlatNavigationForUser(
  userPermissions: string[] = []
): NavigationItem[] {
  const filteredGroups = filterNavigationByPermissions(allNavigationItems, userPermissions);
  const flatItems: NavigationItem[] = [];
  
  filteredGroups.forEach(group => {
    flatItems.push(...group.items);
  });
  
  return flatItems;
}

// Primary navigation function - permission-based only
export function getNavigationForUser(
  userPermissions: string[] = []
): NavigationGroup[] {
  return filterNavigationByPermissions(allNavigationItems, userPermissions);
}

// Helper function to find a navigation item by path
export const findNavigationItem = (
  userPermissions: string[], 
  path: string
): NavigationItem | null => {
  const navigation = getNavigationForUser(userPermissions);
  
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.path === path) {
        return item;
      }
      
      // Check children if they exist
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return child;
          }
        }
      }
    }
  }
  
  return null;
};

// Helper function to get all paths accessible by user permissions
export const getAllPathsForUser = (userPermissions: string[]): string[] => {
  const navigation = getNavigationForUser(userPermissions);
  const paths: string[] = [];
  
  for (const group of navigation) {
    for (const item of group.items) {
      paths.push(item.path);
      
      // Add children paths if they exist
      if (item.children) {
        for (const child of item.children) {
          paths.push(child.path);
        }
      }
    }
  }
  
  return paths;
};

// Helper function to check if a user has access to a specific path
export const hasAccessToPath = (
  userPermissions: string[], 
  path: string
): boolean => {
  const allowedPaths = getAllPathsForUser(userPermissions);
  return allowedPaths.includes(path);
};
