// Enhanced Students management page for admin users

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
  UserPlus,
  Upload,
  ChevronDown,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  X,
  ArrowUpDown,
  Check,
  FileSpreadsheet,
  FileX
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Student type with enhanced fields
type EnhancedStudent = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT';
  avatar: string;
  phoneNumber: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  rollNo: string;
  enrollmentDate: string;
  currentClass: {
    id: string;
    grade: string;
    section: string;
    className: string;
    academicYear: string;
  };
  parentGuardian: {
    fatherName: string;
    fatherPhone: string;
    fatherEmail: string;
    fatherOccupation: string;
    motherName: string;
    motherPhone: string;
    motherEmail: string;
    motherOccupation: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email: string;
  };
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  feeStatus: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate?: string;
    status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  };
};

// Mock data
const mockStudents: EnhancedStudent[] = [
  {
    id: '1',
    username: 'emma.johnson',
    email: 'emma.johnson@example.com',
    firstName: 'Emma',
    lastName: 'Johnson',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0201',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    studentId: 'STU001',
    rollNo: '10A01',
    enrollmentDate: '2024-01-15',
    currentClass: {
      id: 'class-10a',
      grade: '10',
      section: 'A',
      className: 'Grade 10 Section A',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Michael Johnson',
      fatherPhone: '+1-555-0202',
      fatherEmail: 'michael.johnson@example.com',
      fatherOccupation: 'Software Engineer',
      motherName: 'Sarah Johnson',
      motherPhone: '+1-555-0203',
      motherEmail: 'sarah.johnson@example.com',
      motherOccupation: 'Teacher'
    },
    address: {
      street: '123 Oak Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Father',
      phoneNumber: '+1-555-0202',
      email: 'michael.johnson@example.com'
    },
    dateOfBirth: '2009-03-15',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    feeStatus: {
      totalFee: 5000,
      paidAmount: 3000,
      pendingAmount: 2000,
      dueDate: '2024-12-31',
      status: 'PARTIAL'
    }
  },
  {
    id: '2',
    username: 'alex.chen',
    email: 'alex.chen@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0301',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
    studentId: 'STU002',
    rollNo: '10B01',
    enrollmentDate: '2024-01-20',
    currentClass: {
      id: 'class-10b',
      grade: '10',
      section: 'B',
      className: 'Grade 10 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'David Chen',
      fatherPhone: '+1-555-0302',
      fatherEmail: 'david.chen@example.com',
      fatherOccupation: 'Doctor',
      motherName: 'Linda Chen',
      motherPhone: '+1-555-0303',
      motherEmail: 'linda.chen@example.com',
      motherOccupation: 'Nurse'
    },
    address: {
      street: '456 Pine Avenue',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62702',
      country: 'USA'
    },
    emergencyContact: {
      name: 'David Chen',
      relationship: 'Father',
      phoneNumber: '+1-555-0302',
      email: 'david.chen@example.com'
    },
    dateOfBirth: '2009-07-22',
    gender: 'MALE',
    bloodGroup: 'A+',
    feeStatus: {
      totalFee: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: 'PAID'
    }
  },
  {
    id: '3',
    username: 'sophia.martinez',
    email: 'sophia.martinez@example.com',
    firstName: 'Sophia',
    lastName: 'Martinez',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0401',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-08-01T08:00:00Z',
    updatedAt: '2024-08-01T08:00:00Z',
    studentId: 'STU003',
    rollNo: '9A01',
    enrollmentDate: '2024-08-01',
    currentClass: {
      id: 'class-9a',
      grade: '9',
      section: 'A',
      className: 'Grade 9 Section A',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Carlos Martinez',
      fatherPhone: '+1-555-0402',
      fatherEmail: 'carlos.martinez@example.com',
      fatherOccupation: 'Business Owner',
      motherName: 'Maria Martinez',
      motherPhone: '+1-555-0403',
      motherEmail: 'maria.martinez@example.com',
      motherOccupation: 'Accountant'
    },
    address: {
      street: '789 Elm Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62703',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Carlos Martinez',
      relationship: 'Father',
      phoneNumber: '+1-555-0402',
      email: 'carlos.martinez@example.com'
    },
    dateOfBirth: '2010-11-08',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    feeStatus: {
      totalFee: 4500,
      paidAmount: 2000,
      pendingAmount: 2500,
      dueDate: '2024-11-30',
      status: 'PENDING'
    }
  },
  {
    id: '4',
    username: 'ryan.williams',
    email: 'ryan.williams@example.com',
    firstName: 'Ryan',
    lastName: 'Williams',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0501',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-08-05T08:00:00Z',
    updatedAt: '2024-08-05T08:00:00Z',
    studentId: 'STU004',
    rollNo: '11A01',
    enrollmentDate: '2024-08-05',
    currentClass: {
      id: 'class-11a',
      grade: '11',
      section: 'A',
      className: 'Grade 11 Section A',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'James Williams',
      fatherPhone: '+1-555-0502',
      fatherEmail: 'james.williams@example.com',
      fatherOccupation: 'Engineer',
      motherName: 'Jennifer Williams',
      motherPhone: '+1-555-0503',
      motherEmail: 'jennifer.williams@example.com',
      motherOccupation: 'Lawyer'
    },
    address: {
      street: '321 Maple Drive',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'USA'
    },
    emergencyContact: {
      name: 'James Williams',
      relationship: 'Father',
      phoneNumber: '+1-555-0502',
      email: 'james.williams@example.com'
    },
    dateOfBirth: '2008-04-12',
    gender: 'MALE',
    bloodGroup: 'AB+',
    feeStatus: {
      totalFee: 5500,
      paidAmount: 1000,
      pendingAmount: 4500,
      dueDate: '2024-10-15',
      status: 'OVERDUE'
    }
  },
  {
    id: '5',
    username: 'maya.patel',
    email: 'maya.patel@example.com',
    firstName: 'Maya',
    lastName: 'Patel',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0601',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-07-20T08:00:00Z',
    updatedAt: '2024-07-20T08:00:00Z',
    studentId: 'STU005',
    rollNo: '12A01',
    enrollmentDate: '2024-07-20',
    currentClass: {
      id: 'class-12a',
      grade: '12',
      section: 'A',
      className: 'Grade 12 Section A',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Raj Patel',
      fatherPhone: '+1-555-0602',
      fatherEmail: 'raj.patel@example.com',
      fatherOccupation: 'Doctor',
      motherName: 'Priya Patel',
      motherPhone: '+1-555-0603',
      motherEmail: 'priya.patel@example.com',
      motherOccupation: 'Professor'
    },
    address: {
      street: '654 Cedar Lane',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62705',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Raj Patel',
      relationship: 'Father',
      phoneNumber: '+1-555-0602',
      email: 'raj.patel@example.com'
    },
    dateOfBirth: '2007-09-30',
    gender: 'FEMALE',
    bloodGroup: 'O-',
    feeStatus: {
      totalFee: 6000,
      paidAmount: 6000,
      pendingAmount: 0,
      status: 'PAID'
    }
  },
  {
    id: '6',
    username: 'liam.chen',
    email: 'liam.chen@example.com',
    firstName: 'Liam',
    lastName: 'Chen',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0701',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-08-10T08:00:00Z',
    updatedAt: '2024-08-10T08:00:00Z',
    studentId: 'STU006',
    rollNo: '10A02',
    enrollmentDate: '2024-08-10',
    currentClass: {
      id: 'class-10a',
      grade: '10',
      section: 'A',
      className: 'Grade 10 Section A',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Kevin Chen',
      fatherPhone: '+1-555-0702',
      fatherEmail: 'kevin.chen@example.com',
      fatherOccupation: 'Manager',
      motherName: 'Lisa Chen',
      motherPhone: '+1-555-0703',
      motherEmail: 'lisa.chen@example.com',
      motherOccupation: 'Designer'
    },
    address: {
      street: '789 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62706',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Kevin Chen',
      relationship: 'Father',
      phoneNumber: '+1-555-0702',
      email: 'kevin.chen@example.com'
    },
    dateOfBirth: '2009-02-14',
    gender: 'MALE',
    bloodGroup: 'A+',
    feeStatus: {
      totalFee: 5000,
      paidAmount: 2500,
      pendingAmount: 2500,
      dueDate: '2024-12-01',
      status: 'PARTIAL'
    }
  },
  {
    id: '7',
    username: 'olivia.brown',
    email: 'olivia.brown@example.com',
    firstName: 'Olivia',
    lastName: 'Brown',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0801',
    schoolId: 'school-1',
    isActive: false,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
    studentId: 'STU007',
    rollNo: '9B01',
    enrollmentDate: '2024-03-10',
    currentClass: {
      id: 'class-9b',
      grade: '9',
      section: 'B',
      className: 'Grade 9 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Mark Brown',
      fatherPhone: '+1-555-0802',
      fatherEmail: 'mark.brown@example.com',
      fatherOccupation: 'Architect',
      motherName: 'Susan Brown',
      motherPhone: '+1-555-0803',
      motherEmail: 'susan.brown@example.com',
      motherOccupation: 'Nurse'
    },
    address: {
      street: '456 Pine St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62707',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mark Brown',
      relationship: 'Father',
      phoneNumber: '+1-555-0802',
      email: 'mark.brown@example.com'
    },
    dateOfBirth: '2010-06-25',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    feeStatus: {
      totalFee: 4500,
      paidAmount: 0,
      pendingAmount: 4500,
      dueDate: '2024-09-01',
      status: 'OVERDUE'
    }
  },
  {
    id: '8',
    username: 'noah.garcia',
    email: 'noah.garcia@example.com',
    firstName: 'Noah',
    lastName: 'Garcia',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0901',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2024-08-15T08:00:00Z',
    studentId: 'STU008',
    rollNo: '11B01',
    enrollmentDate: '2024-08-15',
    currentClass: {
      id: 'class-11b',
      grade: '11',
      section: 'B',
      className: 'Grade 11 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Miguel Garcia',
      fatherPhone: '+1-555-0902',
      fatherEmail: 'miguel.garcia@example.com',
      fatherOccupation: 'Chef',
      motherName: 'Rosa Garcia',
      motherPhone: '+1-555-0903',
      motherEmail: 'rosa.garcia@example.com',
      motherOccupation: 'Administrator'
    },
    address: {
      street: '987 Sunset Blvd',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62708',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Miguel Garcia',
      relationship: 'Father',
      phoneNumber: '+1-555-0902',
      email: 'miguel.garcia@example.com'
    },
    dateOfBirth: '2008-08-10',
    gender: 'MALE',
    bloodGroup: 'O+',
    feeStatus: {
      totalFee: 5500,
      paidAmount: 5500,
      pendingAmount: 0,
      status: 'PAID'
    }
  },
  {
    id: '9',
    username: 'isabella.taylor',
    email: 'isabella.taylor@example.com',
    firstName: 'Isabella',
    lastName: 'Taylor',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1001',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-07-25T08:00:00Z',
    updatedAt: '2024-07-25T08:00:00Z',
    studentId: 'STU009',
    rollNo: '12B01',
    enrollmentDate: '2024-07-25',
    currentClass: {
      id: 'class-12b',
      grade: '12',
      section: 'B',
      className: 'Grade 12 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Robert Taylor',
      fatherPhone: '+1-555-1002',
      fatherEmail: 'robert.taylor@example.com',
      fatherOccupation: 'Lawyer',
      motherName: 'Jessica Taylor',
      motherPhone: '+1-555-1003',
      motherEmail: 'jessica.taylor@example.com',
      motherOccupation: 'Marketing Manager'
    },
    address: {
      street: '555 Broadway St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62709',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Robert Taylor',
      relationship: 'Father',
      phoneNumber: '+1-555-1002',
      email: 'robert.taylor@example.com'
    },
    dateOfBirth: '2007-01-20',
    gender: 'FEMALE',
    bloodGroup: 'A-',
    feeStatus: {
      totalFee: 6000,
      paidAmount: 3000,
      pendingAmount: 3000,
      dueDate: '2024-12-15',
      status: 'PARTIAL'
    }
  },
  {
    id: '10',
    username: 'ethan.davis',
    email: 'ethan.davis@example.com',
    firstName: 'Ethan',
    lastName: 'Davis',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1101',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-08-12T08:00:00Z',
    updatedAt: '2024-08-12T08:00:00Z',
    studentId: 'STU010',
    rollNo: '9C01',
    enrollmentDate: '2024-08-12',
    currentClass: {
      id: 'class-9c',
      grade: '9',
      section: 'C',
      className: 'Grade 9 Section C',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'William Davis',
      fatherPhone: '+1-555-1102',
      fatherEmail: 'william.davis@example.com',
      fatherOccupation: 'Electrician',
      motherName: 'Amanda Davis',
      motherPhone: '+1-555-1103',
      motherEmail: 'amanda.davis@example.com',
      motherOccupation: 'Teacher'
    },
    address: {
      street: '333 River Road',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62710',
      country: 'USA'
    },
    emergencyContact: {
      name: 'William Davis',
      relationship: 'Father',
      phoneNumber: '+1-555-1102',
      email: 'william.davis@example.com'
    },
    dateOfBirth: '2010-04-03',
    gender: 'MALE',
    bloodGroup: 'B-',
    feeStatus: {
      totalFee: 4500,
      paidAmount: 1500,
      pendingAmount: 3000,
      dueDate: '2024-11-01',
      status: 'PENDING'
    }
  }
];

// Sort types
type SortField = 'name' | 'rollNo' | 'admissionDate' | 'feeStatus';
type SortOrder = 'asc' | 'desc';

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');

  // State for sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // State for bulk operations
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<EnhancedStudent | null>(null);

  // Mock API functions
  const mockBulkActions = {
    sendMessage: (studentIds: string[]) => {
      console.log('Sending message to students:', studentIds);
      alert(`Sending messages to ${studentIds.length} students`);
    },
    promoteStudents: (studentIds: string[]) => {
      console.log('Promoting students:', studentIds);
      alert(`Promoting ${studentIds.length} students`);
    },
    exportData: (format: 'csv' | 'excel' | 'pdf') => {
      console.log(`Exporting ${format} for students:`, selectedStudents.length > 0 ? selectedStudents : 'all');
      alert(`Exporting ${format} for ${selectedStudents.length > 0 ? selectedStudents.length : 'all'} students`);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = mockStudents.length;
    const activeStudents = mockStudents.filter(s => s.isActive).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newAdmissions = mockStudents.filter(s => {
      const admissionDate = new Date(s.enrollmentDate);
      return admissionDate >= thirtyDaysAgo;
    }).length;

    return { totalStudents, activeStudents, newAdmissions };
  }, []);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = mockStudents.filter(student => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower);

      // Grade filter
      const matchesGrade = gradeFilter === 'all' || student.currentClass.grade === gradeFilter;

      // Section filter
      const matchesSection = sectionFilter === 'all' || student.currentClass.section === sectionFilter;

      // Fee status filter
      const matchesFeeStatus = feeStatusFilter === 'all' || student.feeStatus.status === feeStatusFilter;

      // Quick filter
      let matchesQuickFilter = true;
      if (quickFilter === 'paid') {
        matchesQuickFilter = student.feeStatus.status === 'PAID';
      } else if (quickFilter === 'pending') {
        matchesQuickFilter = student.feeStatus.status === 'PENDING' || student.feeStatus.status === 'PARTIAL';
      } else if (quickFilter.startsWith('class-')) {
        const grade = quickFilter.split('-')[1];
        matchesQuickFilter = student.currentClass.grade === grade;
      }

      return matchesSearch && matchesGrade && matchesSection && matchesFeeStatus && matchesQuickFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'rollNo':
          aValue = a.rollNo;
          bValue = b.rollNo;
          break;
        case 'admissionDate':
          aValue = new Date(a.enrollmentDate);
          bValue = new Date(b.enrollmentDate);
          break;
        case 'feeStatus':
          const statusOrder = { 'OVERDUE': 0, 'PENDING': 1, 'PARTIAL': 2, 'PAID': 3 };
          aValue = statusOrder[a.feeStatus.status];
          bValue = statusOrder[b.feeStatus.status];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, gradeFilter, sectionFilter, feeStatusFilter, quickFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter, sectionFilter, feeStatusFilter, quickFilter]);

  // Helper functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(s => s.id));
    }
  };

  const handleDeleteStudent = (student: EnhancedStudent) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      console.log('Deleting student:', studentToDelete.id);
      alert(`Deleting student: ${studentToDelete.firstName} ${studentToDelete.lastName}`);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter);
    setGradeFilter('all');
    setFeeStatusFilter('all');
  };

  // Update bulk actions visibility
  React.useEffect(() => {
    setShowBulkActions(selectedStudents.length > 0);
  }, [selectedStudents]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage and monitor student information, fees, and academic progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button className="space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled this academic year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                Currently attending classes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Admissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newAdmissions}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={quickFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('all')}
          >
            All
          </Button>
          <Button
            variant={quickFilter === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('paid')}
            className="space-x-1"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Paid</span>
          </Button>
          <Button
            variant={quickFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('pending')}
            className="space-x-1"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Pending</span>
          </Button>
          {['9', '10', '11', '12'].map(grade => (
            <Button
              key={grade}
              variant={quickFilter === `class-${grade}` ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(`class-${grade}`)}
            >
              Class {grade}
            </Button>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, student ID, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Fee Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => mockBulkActions.sendMessage(selectedStudents)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => mockBulkActions.promoteStudents(selectedStudents)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Promote
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => mockBulkActions.exportData('csv')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => mockBulkActions.exportData('excel')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => mockBulkActions.exportData('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Students List ({filteredAndSortedStudents.length} total, showing {currentStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('rollNo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Roll No</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('feeStatus')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fee Status</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('admissionDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Admission Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        !student.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleSelectStudent(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">{student.rollNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            {!student.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{student.studentId}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.currentClass.className}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.currentClass.academicYear}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            <a 
                              href={`tel:${student.phoneNumber}`}
                              className="text-blue-600 hover:underline"
                            >
                              {student.phoneNumber}
                            </a>
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            <a 
                              href={`mailto:${student.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {student.email}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getFeeStatusBadge(student.feeStatus.status)}
                          {student.feeStatus.pendingAmount > 0 && (
                            <div className="text-sm text-muted-foreground">
                              ${student.feeStatus.pendingAmount} pending
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigate(`/students/${student.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/students/${student.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {student.isActive ? 'Deactivate' : 'Delete'} Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {currentStudents.length === 0 && (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-muted-foreground">No students found.</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredAndSortedStudents.length > studentsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently {studentToDelete?.isActive ? 'deactivate' : 'delete'} the student
                <strong> {studentToDelete?.firstName} {studentToDelete?.lastName}</strong> and 
                {studentToDelete?.isActive ? ' remove their access to the system.' : ' remove all associated data from the system.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {studentToDelete?.isActive ? 'Deactivate' : 'Delete'} Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentsPage;
