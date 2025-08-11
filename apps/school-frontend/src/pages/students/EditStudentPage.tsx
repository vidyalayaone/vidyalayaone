// Edit existing student form

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  FileText
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Student, UpdateStudentData } from '@/api/types';

// Form validation schema (same as create but all fields optional except required ones)
const editStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().min(1, 'Section is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  
  // Address
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  
  // Parent/Guardian
  fatherName: z.string().min(1, 'Father name is required'),
  fatherPhone: z.string().optional(),
  fatherEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(1, 'Mother name is required'),
  motherPhone: z.string().optional(),
  motherEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  motherOccupation: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  guardianRelation: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactRelation: z.string().min(1, 'Emergency contact relationship is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  emergencyContactEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  
  // Medical Info
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  healthInsurance: z.string().optional(),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

// Mock data for form options
const mockClasses = [
  { id: 'class-9a', grade: '9', section: 'A', name: 'Grade 9 Section A' },
  { id: 'class-9b', grade: '9', section: 'B', name: 'Grade 9 Section B' },
  { id: 'class-10a', grade: '10', section: 'A', name: 'Grade 10 Section A' },
  { id: 'class-10b', grade: '10', section: 'B', name: 'Grade 10 Section B' },
  { id: 'class-11a', grade: '11', section: 'A', name: 'Grade 11 Section A' },
  { id: 'class-11b', grade: '11', section: 'B', name: 'Grade 11 Section B' },
  { id: 'class-12a', grade: '12', section: 'A', name: 'Grade 12 Section A' },
  { id: 'class-12b', grade: '12', section: 'B', name: 'Grade 12 Section B' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Mock student data (same as detail page for consistency)
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
  documents: [],
  academicHistory: [],
  feeStatus: {
    totalFee: 5000,
    paidAmount: 3000,
    pendingAmount: 2000,
    dueDate: '2024-12-31',
    status: 'PENDING',
    transactions: []
  }
};

const EditStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, you would fetch the student data based on the ID
  const student = mockStudent;

  const form = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phoneNumber: student.phoneNumber || '',
      classId: student.currentClass.id,
      grade: student.currentClass.grade,
      section: student.currentClass.section,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      bloodGroup: student.bloodGroup || '',
      street: student.address.street,
      city: student.address.city,
      state: student.address.state,
      postalCode: student.address.postalCode,
      country: student.address.country,
      fatherName: student.parentGuardian.fatherName,
      fatherPhone: student.parentGuardian.fatherPhone || '',
      fatherEmail: student.parentGuardian.fatherEmail || '',
      fatherOccupation: student.parentGuardian.fatherOccupation || '',
      motherName: student.parentGuardian.motherName,
      motherPhone: student.parentGuardian.motherPhone || '',
      motherEmail: student.parentGuardian.motherEmail || '',
      motherOccupation: student.parentGuardian.motherOccupation || '',
      guardianName: student.parentGuardian.guardianName || '',
      guardianPhone: student.parentGuardian.guardianPhone || '',
      guardianEmail: student.parentGuardian.guardianEmail || '',
      guardianRelation: student.parentGuardian.guardianRelation || '',
      emergencyContactName: student.emergencyContact.name,
      emergencyContactRelation: student.emergencyContact.relationship,
      emergencyContactPhone: student.emergencyContact.phoneNumber,
      emergencyContactEmail: student.emergencyContact.email || '',
      allergies: student.medicalInfo?.allergies?.join(', ') || '',
      chronicConditions: student.medicalInfo?.chronicConditions?.join(', ') || '',
      medications: student.medicalInfo?.medications?.join(', ') || '',
      doctorName: student.medicalInfo?.doctorName || '',
      doctorPhone: student.medicalInfo?.doctorPhone || '',
      healthInsurance: student.medicalInfo?.healthInsurance || '',
    },
  });

  const selectedClass = mockClasses.find(c => c.id === form.watch('classId'));

  // Auto-populate grade and section when class is selected
  React.useEffect(() => {
    if (selectedClass) {
      form.setValue('grade', selectedClass.grade);
      form.setValue('section', selectedClass.section);
    }
  }, [selectedClass, form]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditStudentFormData) => {
    setIsSubmitting(true);
    try {
      // Transform form data to match API format
      const studentData: UpdateStudentData = {
        id: student.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber || undefined,
        classId: data.classId,
        grade: data.grade,
        section: data.section,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || undefined,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        parentGuardian: {
          fatherName: data.fatherName,
          fatherPhone: data.fatherPhone || undefined,
          fatherEmail: data.fatherEmail || undefined,
          fatherOccupation: data.fatherOccupation || undefined,
          motherName: data.motherName,
          motherPhone: data.motherPhone || undefined,
          motherEmail: data.motherEmail || undefined,
          motherOccupation: data.motherOccupation || undefined,
          guardianName: data.guardianName || undefined,
          guardianPhone: data.guardianPhone || undefined,
          guardianEmail: data.guardianEmail || undefined,
          guardianRelation: data.guardianRelation || undefined,
        },
        emergencyContact: {
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelation,
          phoneNumber: data.emergencyContactPhone,
          email: data.emergencyContactEmail || undefined,
        },
        medicalInfo: {
          allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : undefined,
          chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(s => s.trim()) : undefined,
          medications: data.medications ? data.medications.split(',').map(s => s.trim()) : undefined,
          doctorName: data.doctorName || undefined,
          doctorPhone: data.doctorPhone || undefined,
          healthInsurance: data.healthInsurance || undefined,
        },
        documents: uploadedFiles,
      };

      console.log('Updating student with data:', studentData);
      
      // Here you would call the API to update the student
      // await updateStudent(studentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate(`/students/${id}`);
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/students/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
            <p className="text-muted-foreground">
              Update information for {student.firstName} {student.lastName}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="parents">Parents/Guardian</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label>Student ID</Label>
                        <Input value={student.studentId} disabled className="bg-gray-50" />
                        <p className="text-xs text-muted-foreground mt-1">Student ID cannot be changed</p>
                      </div>

                      <div>
                        <Label>Enrollment Date</Label>
                        <Input 
                          value={new Date(student.enrollmentDate).toLocaleDateString()} 
                          disabled 
                          className="bg-gray-50" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">Enrollment date cannot be changed</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bloodGroups.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Class Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Class *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockClasses.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label>Auto-filled from class</Label>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Grade:</span> {form.watch('grade') || 'Not selected'}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Section:</span> {form.watch('section') || 'Not selected'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information */}
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Father, Mother, Guardian" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Parents/Guardian Information */}
              <TabsContent value="parents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Father's Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mother's Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Guardian Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Fill this section if someone other than parents is the primary guardian
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian's Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Uncle, Aunt, Grandparent" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical Information */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      This information helps us provide better care for the student
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="List any known allergies (separate with commas)"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormDescription>
                              Separate multiple allergies with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chronicConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chronic Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="List any chronic medical conditions (separate with commas)"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormDescription>
                              Separate multiple conditions with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="List any medications the student is currently taking (separate with commas)"
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <FormDescription>
                              Separate multiple medications with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="doctorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Doctor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Dr. Name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="doctorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor's Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="healthInsurance"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Health Insurance</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Insurance company and policy number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Documents</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload additional documents for the student
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-primary hover:text-primary/80">
                              Upload files
                            </span>
                            <Input
                              id="file-upload"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={handleFileUpload}
                              className="sr-only"
                            />
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB each
                        </p>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">New Files to Upload</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {student.documents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Existing Documents</h4>
                        {student.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {doc.type.replace(/_/g, ' ')}
                                  </Badge>
                                  <span>•</span>
                                  <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/students/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Student
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditStudentPage;
