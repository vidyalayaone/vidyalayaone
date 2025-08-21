// Navigation configuration for different user roles

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
  Library,
  Clock
} from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon: any; // Lucide icon component
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationConfig = {
  ADMIN: [
    {
      label: 'Main',
      items: [
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          description: 'Overview and quick actions'
        },
        { 
          path: '/students', 
          label: 'Students', 
          icon: GraduationCap,
          description: 'Manage student records and enrollment'
        },
        { 
          path: '/teachers', 
          label: 'Teachers', 
          icon: Users,
          description: 'Manage teaching staff and faculty'
        },
        { 
          path: '/classes', 
          label: 'Classes', 
          icon: BookOpen,
          description: 'Manage class schedules and sections'
        },
        // { 
        //   path: '/subjects', 
        //   label: 'Subjects', 
        //   icon: Library,
        //   description: 'Manage subjects, teachers, and curriculum'
        // },
        { 
          path: '/admission', 
          label: 'Admission', 
          icon: UserPlus,
          description: 'Handle new student admissions'
        }
      ]
    },
    {
      label: 'Academic',
      items: [
        { 
          path: '/attendance', 
          label: 'Attendance', 
          icon: CalendarCheck,
          description: 'Track and manage student attendance'
        },
        { 
          path: '/exams', 
          label: 'Exams', 
          icon: PenTool,
          description: 'Manage examinations and assessments'
        },
        { 
          path: '/timetable', 
          label: 'Time Table', 
          icon: Calendar,
          description: 'Manage class schedules and timetables'
        },
        { 
          path: '/substitute-teacher', 
          label: 'Substitute Teacher', 
          icon: Clock,
          description: 'Manage substitute teacher assignments and timetable'
        },
        { 
          path: '/academic-calendar', 
          label: 'Academic Calendar', 
          icon: CalendarDays,
          description: 'Manage academic year calendar'
        }
      ]
    },
    {
      label: 'Operations',
      items: [
        { 
          path: '/communication', 
          label: 'Communication', 
          icon: MessageCircle,
          description: 'Send announcements and messages'
        },
        { 
          path: '/fees', 
          label: 'Fees', 
          icon: DollarSign,
          description: 'Manage student fees and payments'
        }
      ]
    }
  ] as NavigationGroup[],

  TEACHER: [
    {
      label: 'Overview',
      items: [
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          description: 'Teaching overview'
        }
      ]
    },
    {
      label: 'Teaching',
      items: [
        { 
          path: '/my-classes', 
          label: 'My Classes', 
          icon: BookOpen,
          description: 'Classes you teach'
        },
        { 
          path: '/students', 
          label: 'My Students', 
          icon: GraduationCap,
          description: 'Students in your classes'
        },
        { 
          path: '/assignments', 
          label: 'Assignments', 
          icon: FileText,
          description: 'Create and manage assignments'
        },
        { 
          path: '/grading', 
          label: 'Grading', 
          icon: Award,
          description: 'Grade student work'
        }
      ]
    },
    {
      label: 'Administration',
      items: [
        { 
          path: '/attendance', 
          label: 'Attendance', 
          icon: CheckSquare,
          description: 'Mark and view attendance'
        },
        { 
          path: '/reports', 
          label: 'Reports', 
          icon: ClipboardList,
          description: 'Student progress reports'
        }
      ]
    },
    {
      label: 'Communication',
      items: [
        { 
          path: '/messages', 
          label: 'Messages', 
          icon: MessageSquare,
          description: 'Communicate with students and parents'
        },
        { 
          path: '/announcements', 
          label: 'Announcements', 
          icon: Bell,
          description: 'Class announcements'
        }
      ]
    }
  ] as NavigationGroup[],

  STUDENT: [
    {
      label: 'Overview',
      items: [
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          description: 'Your academic overview'
        }
      ]
    },
    {
      label: 'Academics',
      items: [
        { 
          path: '/classes', 
          label: 'My Classes', 
          icon: BookOpen,
          description: 'Your enrolled classes'
        },
        { 
          path: '/assignments', 
          label: 'Assignments', 
          icon: FileText,
          description: 'View and submit assignments'
        },
        { 
          path: '/grades', 
          label: 'Grades', 
          icon: Award,
          description: 'View your grades and progress'
        }
      ]
    },
    {
      label: 'Records',
      items: [
        { 
          path: '/attendance', 
          label: 'Attendance', 
          icon: Calendar,
          description: 'View your attendance record'
        },
        { 
          path: '/schedule', 
          label: 'Schedule', 
          icon: Calendar,
          description: 'Your class schedule'
        }
      ]
    },
    {
      label: 'Communication',
      items: [
        { 
          path: '/messages', 
          label: 'Messages', 
          icon: MessageSquare,
          description: 'Messages from teachers'
        },
        { 
          path: '/announcements', 
          label: 'Announcements', 
          icon: Bell,
          description: 'School and class announcements'
        }
      ]
    }
  ] as NavigationGroup[]
};

// Helper function to get navigation for a specific role
export const getNavigationForRole = (role: 'ADMIN' | 'TEACHER' | 'STUDENT'): NavigationGroup[] => {
  return navigationConfig[role] || [];
};

// Helper function to find a navigation item by path
export const findNavigationItem = (
  role: 'ADMIN' | 'TEACHER' | 'STUDENT', 
  path: string
): NavigationItem | null => {
  const navigation = getNavigationForRole(role);
  
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

// Helper function to get all paths for a role (useful for route protection)
export const getAllPathsForRole = (role: 'ADMIN' | 'TEACHER' | 'STUDENT'): string[] => {
  const navigation = getNavigationForRole(role);
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
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT', 
  path: string
): boolean => {
  const allowedPaths = getAllPathsForRole(userRole);
  return allowedPaths.includes(path);
};