// Student detail view page

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Heart,
  DollarSign,
  GraduationCap,
  Users,
  RotateCcw
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Student } from '@/api/types';

// Mock student data - same as in StudentsPage for consistency
const mockStudent: Student = {
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
  medicalInfo: {
    allergies: ['Peanuts', 'Shellfish'],
    chronicConditions: [],
    medications: [],
    doctorName: 'Dr. Smith',
    doctorPhone: '+1-555-0999',
    healthInsurance: 'Blue Cross Blue Shield - Policy #12345'
  },
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
    },
    {
      id: 'doc3',
      type: 'ADDRESS_PROOF',
      name: 'address_proof.pdf',
      url: '/documents/address_proof.pdf',
      uploadedAt: '2024-01-20T08:00:00Z',
      uploadedBy: 'admin'
    }
  ],
  academicHistory: [
    {
      id: 'aca1',
      academicYear: '2023-24',
      grade: '9',
      section: 'A',
      subjects: [
        {
          subject: { id: 's1', name: 'Mathematics', code: 'MATH', isActive: true },
          grade: 'A',
          marks: 95,
          maxMarks: 100,
          percentage: 95
        },
        {
          subject: { id: 's2', name: 'Science', code: 'SCI', isActive: true },
          grade: 'A-',
          marks: 88,
          maxMarks: 100,
          percentage: 88
        },
        {
          subject: { id: 's3', name: 'English', code: 'ENG', isActive: true },
          grade: 'B+',
          marks: 82,
          maxMarks: 100,
          percentage: 82
        }
      ],
      attendance: 95,
      overallGrade: 'A',
      rank: 3,
      remarks: 'Excellent performance in Mathematics'
    }
  ],
  feeStatus: {
    totalFee: 5000,
    paidAmount: 3000,
    pendingAmount: 2000,
    dueDate: '2024-12-31',
    status: 'PENDING',
    transactions: [
      {
        id: 't1',
        amount: 1500,
        type: 'PAYMENT',
        method: 'BANK_TRANSFER',
        transactionId: 'TXN001',
        date: '2024-01-15',
        remarks: 'First installment'
      },
      {
        id: 't2',
        amount: 1500,
        type: 'PAYMENT',
        method: 'ONLINE',
        transactionId: 'TXN002',
        date: '2024-03-15',
        remarks: 'Second installment'
      }
    ]
  }
};

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // In a real app, you would fetch the student data based on the ID
  const student = mockStudent;

  const handleDeleteStudent = () => {
    console.log('Deleting student:', id);
    // Here you would call the API to delete the student
    navigate('/students');
  };

  const handleResetPassword = () => {
    console.log('Resetting password for student:', id, 'New password:', newPassword);
    // Here you would call the API to reset the password
    setResetPasswordDialogOpen(false);
    setNewPassword('');
  };

  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Uploading documents:', files);
    // Here you would call the API to upload documents
    setUploadDocumentDialogOpen(false);
  };

  const getStatusBadge = () => {
    if (student.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getFeeStatusBadge = () => {
    switch (student.feeStatus.status) {
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

  const getDocumentTypeBadge = (type: string) => {
    const colors = {
      BIRTH_CERTIFICATE: 'bg-blue-100 text-blue-800',
      ID_PROOF: 'bg-purple-100 text-purple-800',
      ADDRESS_PROOF: 'bg-green-100 text-green-800',
      PHOTO: 'bg-yellow-100 text-yellow-800',
      MEDICAL_CERTIFICATE: 'bg-red-100 text-red-800',
      TRANSFER_CERTIFICATE: 'bg-indigo-100 text-indigo-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.OTHER}>
        {type.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/students')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-muted-foreground">Student ID: {student.studentId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setResetPasswordDialogOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Password
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/students/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Student Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="text-lg">
                  {student.firstName[0]}{student.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p className="text-lg font-semibold">{student.currentClass.className}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div>{getStatusBadge()}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Fee Status</p>
                    <div>{getFeeStatusBadge()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {student.email || 'No email'}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {student.phoneNumber || 'No phone'}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">First Name</p>
                      <p className="text-lg">{student.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                      <p className="text-lg">{student.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p>{student.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                      <p>{student.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Username</p>
                      <p className="font-mono text-sm">{student.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>{student.address.street}</p>
                    <p>{student.address.city}, {student.address.state} {student.address.postalCode}</p>
                    <p>{student.address.country}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{student.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                    <p>{student.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{student.emergencyContact.phoneNumber}</p>
                  </div>
                  {student.emergencyContact.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{student.emergencyContact.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Current Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p className="text-lg font-semibold">{student.currentClass.className}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Grade</p>
                    <p>{student.currentClass.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Section</p>
                    <p>{student.currentClass.section}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                    <p>{student.currentClass.academicYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {student.academicHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Academic History</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.academicHistory.map((record) => (
                    <div key={record.id} className="space-y-4 border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">
                          {record.academicYear} - Grade {record.grade} Section {record.section}
                        </h4>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Overall Grade</p>
                          <p className="text-lg font-semibold">{record.overallGrade}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Attendance</p>
                          <p>{record.attendance}%</p>
                        </div>
                        {record.rank && (
                          <div>
                            <p className="text-muted-foreground">Class Rank</p>
                            <p>#{record.rank}</p>
                          </div>
                        )}
                        {record.remarks && (
                          <div>
                            <p className="text-muted-foreground">Remarks</p>
                            <p>{record.remarks}</p>
                          </div>
                        )}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {record.subjects.map((subject, index) => (
                            <TableRow key={index}>
                              <TableCell>{subject.subject.name}</TableCell>
                              <TableCell>{subject.marks}/{subject.maxMarks}</TableCell>
                              <TableCell>{subject.percentage}%</TableCell>
                              <TableCell>
                                <Badge variant="outline">{subject.grade}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Parents Information */}
          <TabsContent value="parents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Father's Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{student.parentGuardian.fatherName}</p>
                  </div>
                  {student.parentGuardian.fatherOccupation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                      <p>{student.parentGuardian.fatherOccupation}</p>
                    </div>
                  )}
                  {student.parentGuardian.fatherPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{student.parentGuardian.fatherPhone}</p>
                    </div>
                  )}
                  {student.parentGuardian.fatherEmail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{student.parentGuardian.fatherEmail}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Mother's Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{student.parentGuardian.motherName}</p>
                  </div>
                  {student.parentGuardian.motherOccupation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                      <p>{student.parentGuardian.motherOccupation}</p>
                    </div>
                  )}
                  {student.parentGuardian.motherPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{student.parentGuardian.motherPhone}</p>
                    </div>
                  )}
                  {student.parentGuardian.motherEmail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{student.parentGuardian.motherEmail}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {(student.parentGuardian.guardianName || student.parentGuardian.guardianPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle>Guardian Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.parentGuardian.guardianName && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>{student.parentGuardian.guardianName}</p>
                      </div>
                    )}
                    {student.parentGuardian.guardianRelation && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                        <p>{student.parentGuardian.guardianRelation}</p>
                      </div>
                    )}
                    {student.parentGuardian.guardianPhone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{student.parentGuardian.guardianPhone}</p>
                      </div>
                    )}
                    {student.parentGuardian.guardianEmail && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{student.parentGuardian.guardianEmail}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medical Information */}
          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                    {student.medicalInfo?.allergies && student.medicalInfo.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.medicalInfo.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None reported</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Chronic Conditions</p>
                    {student.medicalInfo?.chronicConditions && student.medicalInfo.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.medicalInfo.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None reported</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Current Medications</p>
                    {student.medicalInfo?.medications && student.medicalInfo.medications.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.medicalInfo.medications.map((medication, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None reported</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.medicalInfo?.doctorName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Primary Doctor</p>
                      <p>{student.medicalInfo.doctorName}</p>
                      {student.medicalInfo.doctorPhone && (
                        <p className="text-sm text-muted-foreground">{student.medicalInfo.doctorPhone}</p>
                      )}
                    </div>
                  )}
                  {student.medicalInfo?.healthInsurance && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Health Insurance</p>
                      <p>{student.medicalInfo.healthInsurance}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documents
                  </div>
                  <Button size="sm" onClick={() => setUploadDocumentDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.documents.length > 0 ? (
                  <div className="space-y-3">
                    {student.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {getDocumentTypeBadge(doc.type)}
                              <span>•</span>
                              <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Fee Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Fee</p>
                    <p className="text-2xl font-bold">${student.feeStatus.totalFee}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">${student.feeStatus.paidAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                    <p className="text-2xl font-bold text-red-600">${student.feeStatus.pendingAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getFeeStatusBadge()}</div>
                  </div>
                </div>
                
                {student.feeStatus.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p>{new Date(student.feeStatus.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {student.feeStatus.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.feeStatus.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">
                            ${transaction.amount}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.method}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {transaction.transactionId || '-'}
                          </TableCell>
                          <TableCell>{transaction.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student
                <strong> {student.firstName} {student.lastName}</strong> and 
                remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Generate a new temporary password for {student.firstName} {student.lastName}.
                The student will be notified of the new password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password or leave empty to auto-generate"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Document Dialog */}
        <Dialog open={uploadDocumentDialogOpen} onOpenChange={setUploadDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document for {student.firstName} {student.lastName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-upload">Select Document</Label>
                <Input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleUploadDocument}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDocumentDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetailPage;
