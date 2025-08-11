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
  FileText
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

// Mock data for students
const mockStudents: Student[] = [
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
    documents: [
      {
        id: 'doc1',
        type: 'BIRTH_CERTIFICATE',
        name: 'birth_certificate.pdf',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-01-15T08:00:00Z',
        uploadedBy: 'admin'
      },
      {
        id: 'doc2',
        type: 'PHOTO',
        name: 'student_photo.jpg',
        url: '/documents/student_photo.jpg',
        uploadedAt: '2024-01-15T08:00:00Z',
        uploadedBy: 'admin'
      }
    ],
    academicHistory: [],
    feeStatus: {
      totalFee: 5000,
      paidAmount: 3000,
      pendingAmount: 2000,
      dueDate: '2024-12-31',
      status: 'PENDING',
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
  }
];

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

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
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage student records and enrollment
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link to="/students/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Filters and Search */}
        <Card>
          <CardHeader>
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
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
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
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredStudents.length === 0 && (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-muted-foreground">No students found.</p>
                </div>
              )}
            </div>
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
