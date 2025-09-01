export interface NavigationLink {
  name: string
  href: string
}

export const NAV_LINKS: NavigationLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Platform', href: '/platform' },
  { name: 'Why Us', href: '/why-us' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export interface PlatformModule {
  id: string
  title: string
  description: string
  features: string[]
}

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: 'admissions',
    title: 'Admissions Management',
    description: 'Streamline your admission process from application to enrollment.',
    features: [
      'Online application forms with custom fields',
      'Document upload and verification',
      'Application tracking and status updates',
      'Automated communication with applicants',
      'Admission criteria and scoring'
    ]
  },
  {
    id: 'student-info',
    title: 'Student Information System',
    description: 'Comprehensive student profiles and academic records management.',
    features: [
      'Complete student profiles with photos',
      'Academic history and transcripts',
      'Parent and guardian information',
      'Medical records and allergies',
      'Behavioral notes and achievements'
    ]
  },
  {
    id: 'attendance',
    title: 'Attendance Management',
    description: 'Efficient tracking and reporting of student and staff attendance.',
    features: [
      'Quick daily attendance marking',
      'Automated SMS/email notifications to parents',
      'Attendance reports and analytics',
      'Leave management for students and staff',
      'Biometric integration support'
    ]
  },
  {
    id: 'exams',
    title: 'Exams & Grading',
    description: 'Complete examination management and grade processing system.',
    features: [
      'Exam scheduling and hall assignments',
      'Online and offline grade entry',
      'Report card generation and distribution',
      'Performance analytics and trends',
      'Parent portal for grade access'
    ]
  },
  {
    id: 'fees',
    title: 'Fees & Payments',
    description: 'Simplified fee collection and financial management.',
    features: [
      'Flexible fee structure configuration',
      'Online payment gateway integration',
      'Payment reminders and overdue notices',
      'Receipt generation and tracking',
      'Financial reports and reconciliation'
    ]
  },
  {
    id: 'accounting',
    title: 'School Accounting',
    description: 'Complete financial management for educational institutions.',
    features: [
      'Chart of accounts for schools',
      'Income and expense tracking',
      'Budget planning and monitoring',
      'Payroll management integration',
      'Financial statements and reports'
    ]
  },
  {
    id: 'staff',
    title: 'Staff Management',
    description: 'Human resource management for educational staff.',
    features: [
      'Employee profiles and contracts',
      'Payroll processing and tax management',
      'Leave and attendance tracking',
      'Performance evaluation system',
      'Document management and compliance'
    ]
  },
  {
    id: 'library',
    title: 'Library Management',
    description: 'Digital library system for book and resource management.',
    features: [
      'Book catalog and inventory management',
      'Issue and return tracking',
      'Late fee calculation',
      'Digital resource management',
      'Student reading history and reports'
    ]
  },
  {
    id: 'communication',
    title: 'Communication Hub',
    description: 'Centralized communication platform for school community.',
    features: [
      'SMS and email broadcasting',
      'Parent-teacher messaging system',
      'Announcement and notice board',
      'Event calendar and reminders',
      'Mobile app for instant updates'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Data-driven insights for better decision making.',
    features: [
      'Student performance analytics',
      'Attendance and behavior trends',
      'Financial performance dashboards',
      'Custom report builder',
      'Export capabilities for compliance'
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Enterprise-grade security and data protection.',
    features: [
      'Role-based access control',
      'Data encryption and backup',
      'Audit trails and compliance reporting',
      'GDPR and privacy compliance',
      'Regular security updates'
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Applications',
    description: 'Native mobile apps for parents, students, and teachers.',
    features: [
      'iOS and Android applications',
      'Real-time notifications and updates',
      'Offline capability for essential features',
      'Biometric authentication support',
      'Responsive web interface'
    ]
  }
]

export interface BenefitCard {
  title: string
  description: string
  icon: string
}

export const BENEFIT_CARDS: BenefitCard[] = [
  {
    title: 'Admissions',
    description: 'Streamline your admission process with online applications, document verification, and automated workflows.',
    icon: '📝'
  },
  {
    title: 'Fees & Payments',
    description: 'Simplify fee collection with multiple payment options, automated reminders, and detailed financial reporting.',
    icon: '💳'
  },
  {
    title: 'Exams & Grading',
    description: 'Manage examinations efficiently with scheduling, grading, report generation, and performance analytics.',
    icon: '📊'
  },
  {
    title: 'Attendance',
    description: 'Track student and staff attendance with automated notifications and comprehensive reporting.',
    icon: '📅'
  },
  {
    title: 'Communication',
    description: 'Connect with parents, students, and staff through integrated messaging, announcements, and notifications.',
    icon: '💬'
  },
  {
    title: 'Analytics',
    description: 'Make data-driven decisions with powerful analytics, custom reports, and performance insights.',
    icon: '📈'
  }
]
