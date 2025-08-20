// Students management page for admin users

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  MapPin,
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

import { Student } from '@/api/types';

// Extended Student type for the UI
type StudentWithRollNo = Student & { 
  rollNo: string;
  feeStatus: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate?: string;
    status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
    transactions: any[];
  };
};

// Mock API functions
const mockFetchStudentsStats = () => {
  return Promise.resolve({
    totalStudents: mockStudents.length,
    activeStudents: mockStudents.filter(s => s.isActive).length,
    newAdmissions: mockStudents.filter(s => {
      const admissionDate = new Date(s.enrollmentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return admissionDate >= thirtyDaysAgo;
    }).length
  });
};

const mockBulkActions = {
  sendMessage: (studentIds: string[]) => {
    console.log('Sending message to students:', studentIds);
    return Promise.resolve({ success: true, message: 'Messages sent successfully' });
  },
  promoteStudents: (studentIds: string[]) => {
    console.log('Promoting students:', studentIds);
    return Promise.resolve({ success: true, message: 'Students promoted successfully' });
  },
  exportData: (format: 'csv' | 'excel' | 'pdf', studentIds?: string[]) => {
    console.log(`Exporting ${format} for students:`, studentIds || 'all');
    return Promise.resolve({ success: true, downloadUrl: `/exports/students.${format}` });
  }
};

// Mock data for students with enhanced structure
const mockStudents: StudentWithRollNo[] = [
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 3000,
      pendingAmount: 2000,
      dueDate: '2024-12-31',
      status: 'PARTIAL',
      transactions: []
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 2000,
      pendingAmount: 2500,
      dueDate: '2024-11-30',
      status: 'PENDING',
      transactions: []
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 1000,
      pendingAmount: 4500,
      dueDate: '2024-10-15',
      status: 'OVERDUE',
      transactions: []
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 6000,
      paidAmount: 6000,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
    }
  },
  // Add more realistic students for better demo
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 2500,
      pendingAmount: 2500,
      dueDate: '2024-12-01',
      status: 'PARTIAL',
      transactions: []
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 0,
      pendingAmount: 4500,
      dueDate: '2024-09-01',
      status: 'OVERDUE',
      transactions: []
    }
  }
];
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
    documents: [
      {
        id: 'doc3',
        type: 'BIRTH_CERTIFICATE',
        name: 'birth_certificate.pdf',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-01-20T08:00:00Z',
        uploadedBy: 'admin'
      }
    ],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
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
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    studentId: 'STU003',
    enrollmentDate: '2024-02-01',
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
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 2000,
      pendingAmount: 2500,
      dueDate: '2024-11-30',
      status: 'PENDING',
      transactions: []
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
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-15T08:00:00Z',
    studentId: 'STU004',
    enrollmentDate: '2024-02-15',
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
      motherName: 'Lisa Williams',
      motherPhone: '+1-555-0503',
      motherEmail: 'lisa.williams@example.com',
      motherOccupation: 'Designer'
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
    dateOfBirth: '2008-05-12',
    gender: 'MALE',
    bloodGroup: 'AB+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 5500,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
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
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z',
    studentId: 'STU005',
    enrollmentDate: '2024-03-01',
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
      fatherOccupation: 'Business Owner',
      motherName: 'Priya Patel',
      motherPhone: '+1-555-0603',
      motherEmail: 'priya.patel@example.com',
      motherOccupation: 'Lawyer'
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
    dateOfBirth: '2007-09-25',
    gender: 'FEMALE',
    bloodGroup: 'A-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 6000,
      paidAmount: 3000,
      pendingAmount: 3000,
      dueDate: '2024-10-31',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '6',
    username: 'ethan.brown',
    email: 'ethan.brown@example.com',
    firstName: 'Ethan',
    lastName: 'Brown',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0701',
    schoolId: 'school-1',
    isActive: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-08-10T08:00:00Z',
    studentId: 'STU006',
    enrollmentDate: '2024-01-10',
    currentClass: {
      id: 'class-9b',
      grade: '9',
      section: 'B',
      className: 'Grade 9 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Mark Brown',
      fatherPhone: '+1-555-0702',
      fatherEmail: 'mark.brown@example.com',
      fatherOccupation: 'Manager',
      motherName: 'Jessica Brown',
      motherPhone: '+1-555-0703',
      motherEmail: 'jessica.brown@example.com',
      motherOccupation: 'Nurse'
    },
    address: {
      street: '987 Birch Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62706',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mark Brown',
      relationship: 'Father',
      phoneNumber: '+1-555-0702',
      email: 'mark.brown@example.com'
    },
    dateOfBirth: '2010-12-03',
    gender: 'MALE',
    bloodGroup: 'O-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 1500,
      pendingAmount: 3000,
      dueDate: '2024-09-30',
      status: 'OVERDUE',
      transactions: []
    }
  },
  {
    id: '7',
    username: 'ava.davis',
    email: 'ava.davis@example.com',
    firstName: 'Ava',
    lastName: 'Davis',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0801',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-02-20T08:00:00Z',
    studentId: 'STU007',
    enrollmentDate: '2024-02-20',
    currentClass: {
      id: 'class-10c',
      grade: '10',
      section: 'C',
      className: 'Grade 10 Section C',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Robert Davis',
      fatherPhone: '+1-555-0802',
      fatherEmail: 'robert.davis@example.com',
      fatherOccupation: 'Architect',
      motherName: 'Emily Davis',
      motherPhone: '+1-555-0803',
      motherEmail: 'emily.davis@example.com',
      motherOccupation: 'Artist'
    },
    address: {
      street: '147 Willow Way',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62707',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Robert Davis',
      relationship: 'Father',
      phoneNumber: '+1-555-0802',
      email: 'robert.davis@example.com'
    },
    dateOfBirth: '2009-04-18',
    gender: 'FEMALE',
    bloodGroup: 'B-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 2500,
      pendingAmount: 2500,
      dueDate: '2024-11-15',
      status: 'PENDING',
      transactions: []
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
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
    studentId: 'STU008',
    enrollmentDate: '2024-03-10',
    currentClass: {
      id: 'class-11b',
      grade: '11',
      section: 'B',
      className: 'Grade 11 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Diego Garcia',
      fatherPhone: '+1-555-0902',
      fatherEmail: 'diego.garcia@example.com',
      fatherOccupation: 'Chef',
      motherName: 'Sofia Garcia',
      motherPhone: '+1-555-0903',
      motherEmail: 'sofia.garcia@example.com',
      motherOccupation: 'Teacher'
    },
    address: {
      street: '258 Aspen Road',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62708',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Diego Garcia',
      relationship: 'Father',
      phoneNumber: '+1-555-0902',
      email: 'diego.garcia@example.com'
    },
    dateOfBirth: '2008-08-14',
    gender: 'MALE',
    bloodGroup: 'AB-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 5500,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
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
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-25T08:00:00Z',
    studentId: 'STU009',
    enrollmentDate: '2024-01-25',
    currentClass: {
      id: 'class-12b',
      grade: '12',
      section: 'B',
      className: 'Grade 12 Section B',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Andrew Taylor',
      fatherPhone: '+1-555-1002',
      fatherEmail: 'andrew.taylor@example.com',
      fatherOccupation: 'Lawyer',
      motherName: 'Michelle Taylor',
      motherPhone: '+1-555-1003',
      motherEmail: 'michelle.taylor@example.com',
      motherOccupation: 'Doctor'
    },
    address: {
      street: '369 Poplar Place',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62709',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Andrew Taylor',
      relationship: 'Father',
      phoneNumber: '+1-555-1002',
      email: 'andrew.taylor@example.com'
    },
    dateOfBirth: '2007-01-30',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 6000,
      paidAmount: 6000,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
    }
  },
  {
    id: '10',
    username: 'liam.anderson',
    email: 'liam.anderson@example.com',
    firstName: 'Liam',
    lastName: 'Anderson',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1101',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-05T08:00:00Z',
    updatedAt: '2024-02-05T08:00:00Z',
    studentId: 'STU010',
    enrollmentDate: '2024-02-05',
    currentClass: {
      id: 'class-9c',
      grade: '9',
      section: 'C',
      className: 'Grade 9 Section C',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Kevin Anderson',
      fatherPhone: '+1-555-1102',
      fatherEmail: 'kevin.anderson@example.com',
      fatherOccupation: 'Electrician',
      motherName: 'Amanda Anderson',
      motherPhone: '+1-555-1103',
      motherEmail: 'amanda.anderson@example.com',
      motherOccupation: 'Secretary'
    },
    address: {
      street: '741 Spruce Circle',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62710',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Kevin Anderson',
      relationship: 'Father',
      phoneNumber: '+1-555-1102',
      email: 'kevin.anderson@example.com'
    },
    dateOfBirth: '2010-06-20',
    gender: 'MALE',
    bloodGroup: 'A+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 2000,
      pendingAmount: 2500,
      dueDate: '2024-12-15',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '11',
    username: 'olivia.thomas',
    email: 'olivia.thomas@example.com',
    firstName: 'Olivia',
    lastName: 'Thomas',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1201',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
    studentId: 'STU011',
    enrollmentDate: '2024-03-15',
    currentClass: {
      id: 'class-10d',
      grade: '10',
      section: 'D',
      className: 'Grade 10 Section D',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Brian Thomas',
      fatherPhone: '+1-555-1202',
      fatherEmail: 'brian.thomas@example.com',
      fatherOccupation: 'Mechanic',
      motherName: 'Rachel Thomas',
      motherPhone: '+1-555-1203',
      motherEmail: 'rachel.thomas@example.com',
      motherOccupation: 'Librarian'
    },
    address: {
      street: '852 Hickory Hill',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62711',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Brian Thomas',
      relationship: 'Father',
      phoneNumber: '+1-555-1202',
      email: 'brian.thomas@example.com'
    },
    dateOfBirth: '2009-10-08',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 1000,
      pendingAmount: 4000,
      dueDate: '2024-10-01',
      status: 'OVERDUE',
      transactions: []
    }
  },
  {
    id: '12',
    username: 'lucas.jackson',
    email: 'lucas.jackson@example.com',
    firstName: 'Lucas',
    lastName: 'Jackson',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1301',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-30T08:00:00Z',
    updatedAt: '2024-01-30T08:00:00Z',
    studentId: 'STU012',
    enrollmentDate: '2024-01-30',
    currentClass: {
      id: 'class-11c',
      grade: '11',
      section: 'C',
      className: 'Grade 11 Section C',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Samuel Jackson',
      fatherPhone: '+1-555-1302',
      fatherEmail: 'samuel.jackson@example.com',
      fatherOccupation: 'Plumber',
      motherName: 'Nicole Jackson',
      motherPhone: '+1-555-1303',
      motherEmail: 'nicole.jackson@example.com',
      motherOccupation: 'Pharmacist'
    },
    address: {
      street: '963 Chestnut Court',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62712',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Samuel Jackson',
      relationship: 'Father',
      phoneNumber: '+1-555-1302',
      email: 'samuel.jackson@example.com'
    },
    dateOfBirth: '2008-02-28',
    gender: 'MALE',
    bloodGroup: 'AB+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 2750,
      pendingAmount: 2750,
      dueDate: '2024-11-30',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '13',
    username: 'charlotte.white',
    email: 'charlotte.white@example.com',
    firstName: 'Charlotte',
    lastName: 'White',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1401',
    schoolId: 'school-1',
    isActive: false,
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-07-10T08:00:00Z',
    studentId: 'STU013',
    enrollmentDate: '2024-02-10',
    currentClass: {
      id: 'class-12c',
      grade: '12',
      section: 'C',
      className: 'Grade 12 Section C',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Daniel White',
      fatherPhone: '+1-555-1402',
      fatherEmail: 'daniel.white@example.com',
      fatherOccupation: 'Carpenter',
      motherName: 'Jennifer White',
      motherPhone: '+1-555-1403',
      motherEmail: 'jennifer.white@example.com',
      motherOccupation: 'Nurse'
    },
    address: {
      street: '174 Walnut Way',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62713',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Daniel White',
      relationship: 'Father',
      phoneNumber: '+1-555-1402',
      email: 'daniel.white@example.com'
    },
    dateOfBirth: '2007-11-15',
    gender: 'FEMALE',
    bloodGroup: 'O-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 6000,
      paidAmount: 0,
      pendingAmount: 6000,
      dueDate: '2024-08-01',
      status: 'OVERDUE',
      transactions: []
    }
  },
  {
    id: '14',
    username: 'mason.harris',
    email: 'mason.harris@example.com',
    firstName: 'Mason',
    lastName: 'Harris',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1501',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-20T08:00:00Z',
    studentId: 'STU014',
    enrollmentDate: '2024-03-20',
    currentClass: {
      id: 'class-9d',
      grade: '9',
      section: 'D',
      className: 'Grade 9 Section D',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Gregory Harris',
      fatherPhone: '+1-555-1502',
      fatherEmail: 'gregory.harris@example.com',
      fatherOccupation: 'Banker',
      motherName: 'Stephanie Harris',
      motherPhone: '+1-555-1503',
      motherEmail: 'stephanie.harris@example.com',
      motherOccupation: 'Marketing Manager'
    },
    address: {
      street: '285 Sycamore Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62714',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Gregory Harris',
      relationship: 'Father',
      phoneNumber: '+1-555-1502',
      email: 'gregory.harris@example.com'
    },
    dateOfBirth: '2010-04-05',
    gender: 'MALE',
    bloodGroup: 'A-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 4500,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
    }
  },
  {
    id: '15',
    username: 'amelia.clark',
    email: 'amelia.clark@example.com',
    firstName: 'Amelia',
    lastName: 'Clark',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1601',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
    studentId: 'STU015',
    enrollmentDate: '2024-01-12',
    currentClass: {
      id: 'class-10e',
      grade: '10',
      section: 'E',
      className: 'Grade 10 Section E',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Patrick Clark',
      fatherPhone: '+1-555-1602',
      fatherEmail: 'patrick.clark@example.com',
      fatherOccupation: 'Sales Manager',
      motherName: 'Catherine Clark',
      motherPhone: '+1-555-1603',
      motherEmail: 'catherine.clark@example.com',
      motherOccupation: 'HR Manager'
    },
    address: {
      street: '396 Dogwood Drive',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62715',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Patrick Clark',
      relationship: 'Father',
      phoneNumber: '+1-555-1602',
      email: 'patrick.clark@example.com'
    },
    dateOfBirth: '2009-12-22',
    gender: 'FEMALE',
    bloodGroup: 'B-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 3500,
      pendingAmount: 1500,
      dueDate: '2024-12-01',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '16',
    username: 'benjamin.lewis',
    email: 'benjamin.lewis@example.com',
    firstName: 'Benjamin',
    lastName: 'Lewis',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1701',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-25T08:00:00Z',
    updatedAt: '2024-02-25T08:00:00Z',
    studentId: 'STU016',
    enrollmentDate: '2024-02-25',
    currentClass: {
      id: 'class-11d',
      grade: '11',
      section: 'D',
      className: 'Grade 11 Section D',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Christopher Lewis',
      fatherPhone: '+1-555-1702',
      fatherEmail: 'christopher.lewis@example.com',
      fatherOccupation: 'IT Manager',
      motherName: 'Angela Lewis',
      motherPhone: '+1-555-1703',
      motherEmail: 'angela.lewis@example.com',
      motherOccupation: 'Project Manager'
    },
    address: {
      street: '507 Magnolia Manor',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62716',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Christopher Lewis',
      relationship: 'Father',
      phoneNumber: '+1-555-1702',
      email: 'christopher.lewis@example.com'
    },
    dateOfBirth: '2008-07-11',
    gender: 'MALE',
    bloodGroup: 'AB-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 5500,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
    }
  },
  {
    id: '17',
    username: 'harper.robinson',
    email: 'harper.robinson@example.com',
    firstName: 'Harper',
    lastName: 'Robinson',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1801',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-05T08:00:00Z',
    studentId: 'STU017',
    enrollmentDate: '2024-03-05',
    currentClass: {
      id: 'class-12d',
      grade: '12',
      section: 'D',
      className: 'Grade 12 Section D',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Matthew Robinson',
      fatherPhone: '+1-555-1802',
      fatherEmail: 'matthew.robinson@example.com',
      fatherOccupation: 'Consultant',
      motherName: 'Rebecca Robinson',
      motherPhone: '+1-555-1803',
      motherEmail: 'rebecca.robinson@example.com',
      motherOccupation: 'Financial Advisor'
    },
    address: {
      street: '618 Redwood Ridge',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62717',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Matthew Robinson',
      relationship: 'Father',
      phoneNumber: '+1-555-1802',
      email: 'matthew.robinson@example.com'
    },
    dateOfBirth: '2007-03-17',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 6000,
      paidAmount: 4000,
      pendingAmount: 2000,
      dueDate: '2024-11-01',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '18',
    username: 'elijah.walker',
    email: 'elijah.walker@example.com',
    firstName: 'Elijah',
    lastName: 'Walker',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-1901',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-08T08:00:00Z',
    studentId: 'STU018',
    enrollmentDate: '2024-01-08',
    currentClass: {
      id: 'class-9e',
      grade: '9',
      section: 'E',
      className: 'Grade 9 Section E',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Jonathan Walker',
      fatherPhone: '+1-555-1902',
      fatherEmail: 'jonathan.walker@example.com',
      fatherOccupation: 'Veterinarian',
      motherName: 'Melissa Walker',
      motherPhone: '+1-555-1903',
      motherEmail: 'melissa.walker@example.com',
      motherOccupation: 'Real Estate Agent'
    },
    address: {
      street: '729 Oakwood Oval',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62718',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jonathan Walker',
      relationship: 'Father',
      phoneNumber: '+1-555-1902',
      email: 'jonathan.walker@example.com'
    },
    dateOfBirth: '2010-09-13',
    gender: 'MALE',
    bloodGroup: 'A+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 4500,
      paidAmount: 2250,
      pendingAmount: 2250,
      dueDate: '2024-12-20',
      status: 'PENDING',
      transactions: []
    }
  },
  {
    id: '19',
    username: 'evelyn.hall',
    email: 'evelyn.hall@example.com',
    firstName: 'Evelyn',
    lastName: 'Hall',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-2001',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-28T08:00:00Z',
    updatedAt: '2024-02-28T08:00:00Z',
    studentId: 'STU019',
    enrollmentDate: '2024-02-28',
    currentClass: {
      id: 'class-10f',
      grade: '10',
      section: 'F',
      className: 'Grade 10 Section F',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Richard Hall',
      fatherPhone: '+1-555-2002',
      fatherEmail: 'richard.hall@example.com',
      fatherOccupation: 'Police Officer',
      motherName: 'Laura Hall',
      motherPhone: '+1-555-2003',
      motherEmail: 'laura.hall@example.com',
      motherOccupation: 'Social Worker'
    },
    address: {
      street: '840 Pine Point',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62719',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Richard Hall',
      relationship: 'Father',
      phoneNumber: '+1-555-2002',
      email: 'richard.hall@example.com'
    },
    dateOfBirth: '2009-05-27',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: 'PAID',
      transactions: []
    }
  },
  {
    id: '20',
    username: 'james.young',
    email: 'james.young@example.com',
    firstName: 'James',
    lastName: 'Young',
    role: 'STUDENT',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-2101',
    schoolId: 'school-1',
    isActive: false,
    createdAt: '2024-03-12T08:00:00Z',
    updatedAt: '2024-06-12T08:00:00Z',
    studentId: 'STU020',
    enrollmentDate: '2024-03-12',
    currentClass: {
      id: 'class-11e',
      grade: '11',
      section: 'E',
      className: 'Grade 11 Section E',
      academicYear: '2024-25'
    },
    parentGuardian: {
      fatherName: 'Thomas Young',
      fatherPhone: '+1-555-2102',
      fatherEmail: 'thomas.young@example.com',
      fatherOccupation: 'Firefighter',
      motherName: 'Karen Young',
      motherPhone: '+1-555-2103',
      motherEmail: 'karen.young@example.com',
      motherOccupation: 'Physical Therapist'
    },
    address: {
      street: '951 Elmwood End',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62720',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Thomas Young',
      relationship: 'Father',
      phoneNumber: '+1-555-2102',
      email: 'thomas.young@example.com'
    },
    dateOfBirth: '2008-10-31',
    gender: 'MALE',
    bloodGroup: 'O-',
    documents: [],
    academicHistory: [],
    feeStatus: {
      totalFee: 5500,
      paidAmount: 1000,
      pendingAmount: 4500,
      dueDate: '2024-09-15',
      status: 'OVERDUE',
      transactions: []
    }
  }
];

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.currentClass.className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = gradeFilter === 'all' || student.currentClass.grade === gradeFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && student.isActive) ||
        (statusFilter === 'inactive' && !student.isActive);

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [searchTerm, gradeFilter, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter, statusFilter]);

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      console.log('Deleting student:', studentToDelete.id);
      // Here you would call the API to delete the student
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const getStatusBadge = (student: Student) => {
    if (student.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Calculate stats
  const totalStudents = mockStudents.length;
  const activeStudents = mockStudents.filter(s => s.isActive).length;
  const pendingFees = mockStudents.filter(s => s.feeStatus.status === 'PENDING').length;
  const totalPendingAmount = mockStudents.reduce((sum, s) => sum + s.feeStatus.pendingAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Students Details Card with integrated stats and filters */}
        <Card>
          <CardHeader>
            <CardTitle>Students Details ({filteredStudents.length} total, showing {currentStudents.length})</CardTitle>
            {/* Search and Filters Section */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, ID, email, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-32">
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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
            
            {/* Stats Cards Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeStudents} active students
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently enrolled
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingFees}</div>
                  <p className="text-xs text-muted-foreground">
                    Students with pending fees
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPendingAmount}</div>
                  <p className="text-xs text-muted-foreground">
                    Total pending amount
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
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
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
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
                          {student.phoneNumber && (
                            <div className="flex items-center text-sm">
                              <Phone className="mr-1 h-3 w-3" />
                              {student.phoneNumber}
                            </div>
                          )}
                          {student.parentGuardian.fatherPhone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="mr-1 h-3 w-3" />
                              {student.parentGuardian.fatherPhone} (Father)
                            </div>
                          )}
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
                      <TableCell>{getStatusBadge(student)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                              Delete Student
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
            
            {/* Pagination Controls */}
            {filteredStudents.length > studentsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    ))}
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
                This action cannot be undone. This will permanently delete the student
                <strong> {studentToDelete?.firstName} {studentToDelete?.lastName}</strong> and 
                remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentsPage;
