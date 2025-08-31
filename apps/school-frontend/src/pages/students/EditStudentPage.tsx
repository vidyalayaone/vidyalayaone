import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, User, GraduationCap, Phone, Users } from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getStudentById, updateStudent } from '@/api/api';
import type { ProfileServiceStudent, CreateStudentRequest } from '@/api/types';
import toast from 'react-hot-toast';
import { useClassesStore } from '@/store/classesStore';
import { useAuthStore } from '@/store/authStore';

// Updated schema to match Basic Information tab fields
const editStudentSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  category: z.string().optional(),
  bloodGroup: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  
  // Academic Information
  className: z.string().min(1, 'Class is required'), // This will be the classId
  sectionName: z.string().min(1, 'Section is required'), // This will be the sectionId
  rollNumber: z.string().min(1, 'Roll number is required'),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  
  // Contact Information
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email('Valid email is required').optional().or(z.literal('')),
  
  // Parents/Guardians Information
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianOccupation: z.string().optional(),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

const EditStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const [student, setStudent] = useState<ProfileServiceStudent | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);

  // Auth and classes store
  const { school } = useAuthStore();
  const classesFromStore = useClassesStore(state => state.classes);
  const fetchClassesAndSections = useClassesStore(state => state.fetchClassesAndSections);
  const classesStoreLoading = useClassesStore(state => state.isLoading);
  
  // Get available sections for selected class
  const availableSections = React.useMemo(() => {
    if (!selectedClassId || !classesFromStore) return [];
    const selectedClass = classesFromStore.find(cls => cls.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classesFromStore]);

  // Fetch classes and sections for the current school
  React.useEffect(() => {
    if (!school?.id) return;
    fetchClassesAndSections(school.id, '2025-26').catch(console.error);
  }, [school?.id, fetchClassesAndSections]);

  const form = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema as any),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      religion: '',
      category: '',
      bloodGroup: '',
      aadhaarNumber: '',
      className: '',
      sectionName: '',
      rollNumber: '',
      admissionNumber: '',
      admissionDate: '',
      address: '',
      phoneNumber: '',
      emailAddress: '',
      fatherName: '',
      fatherPhone: '',
      motherName: '',
      motherPhone: '',
      guardianName: '',
      guardianPhone: '',
      guardianOccupation: '',
    },
  });
  
  // Helper functions for extracting student data
  const getContactPhone = (student: ProfileServiceStudent): string => {
    if (student.contactInfo?.phone) {
      return student.contactInfo.phone;
    }
    return '';
  };

  const getContactEmail = (student: ProfileServiceStudent): string => {
    if (student.contactInfo?.email) {
      return student.contactInfo.email;
    }
    return '';
  };

  const getAddressString = (student: ProfileServiceStudent): string => {
    if (student.address && typeof student.address === 'object') {
      const addr = student.address;
      const parts = [
        addr.street,
        addr.city,
        addr.state,
        addr.pincode
      ].filter(Boolean);
      return parts.join(', ') || '';
    }
    return student.address || '';
  };

  const getFatherGuardian = (student: ProfileServiceStudent) => {
    const fatherRelation = student.guardians.find(sg => 
      sg.relation?.toLowerCase() === 'father'
    );
    return fatherRelation?.guardian || null;
  };

  const getMotherGuardian = (student: ProfileServiceStudent) => {
    const motherRelation = student.guardians.find(sg => 
      sg.relation?.toLowerCase() === 'mother'
    );
    return motherRelation?.guardian || null;
  };

  const getGuardian = (student: ProfileServiceStudent) => {
    const guardianRelation = student.guardians.find(sg => 
      sg.relation?.toLowerCase() === 'guardian' ||
      sg.relation?.toLowerCase() === 'other'
    );
    return guardianRelation?.guardian || null;
  };

  const getCurrentEnrollment = (student: ProfileServiceStudent) => {
    return student.enrollments.find(enrollment => enrollment.isCurrent) || student.enrollments[0];
  };

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      setIsLoadingStudent(true);
      try {
        const response = await getStudentById(id);
        if (response.success && response.data) {
          const fetchedStudent = response.data.student;
          setStudent(fetchedStudent);
          
          // Prepare form values from fetched student data
          const father = getFatherGuardian(fetchedStudent);
          const mother = getMotherGuardian(fetchedStudent);
          const guardian = getGuardian(fetchedStudent);
          const currentEnrollment = getCurrentEnrollment(fetchedStudent);

          // Format date strings to YYYY-MM-DD for input[type="date"]
          const formatDateForInput = (dateString?: string) => {
            if (!dateString) return '';
            return dateString.split('T')[0]; // Get only the date part
          };

          // If we have class info and classes are loaded, find the matching class
          if (currentEnrollment?.classId && classesFromStore.length > 0) {
            setSelectedClassId(currentEnrollment.classId);
          }
          
          // Update form values with fetched data
          form.reset({
            firstName: fetchedStudent.firstName || '',
            lastName: fetchedStudent.lastName || '',
            dateOfBirth: formatDateForInput(fetchedStudent.dateOfBirth),
            gender: fetchedStudent.gender || '',
            religion: fetchedStudent.religion || '',
            category: fetchedStudent.category || '',
            bloodGroup: fetchedStudent.bloodGroup || '',
            aadhaarNumber: fetchedStudent.metaData?.aadhaarNumber || '',
            className: currentEnrollment?.classId || '', // Use classId for dropdown
            sectionName: currentEnrollment?.sectionId || '', // Use sectionId for dropdown
            rollNumber: currentEnrollment?.rollNumber || '',
            admissionNumber: fetchedStudent.admissionNumber || '',
            admissionDate: formatDateForInput(fetchedStudent.admissionDate),
            address: getAddressString(fetchedStudent),
            phoneNumber: getContactPhone(fetchedStudent),
            emailAddress: getContactEmail(fetchedStudent),
            fatherName: father ? `${father.firstName} ${father.lastName}`.trim() : '',
            fatherPhone: father?.phone || '',
            motherName: mother ? `${mother.firstName} ${mother.lastName}`.trim() : '',
            motherPhone: mother?.phone || '',
            guardianName: guardian ? `${guardian.firstName} ${guardian.lastName}`.trim() : '',
            guardianPhone: guardian?.phone || '',
            guardianOccupation: guardian?.metaData?.occupation || '',
          });
        } else {
          toast.error('Student not found');
          navigate('/students');
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        toast.error('Failed to load student data');
        navigate('/students');
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [id, form, navigate]);

  const onSubmit = async (data: EditStudentFormData) => {
    if (!id || !student) {
      toast.error('Student ID not found');
      return;
    }
    
    setIsLoading(true);
    try {
      // Helper function to convert date string to ISO datetime
      const formatDateToISO = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        try {
          // Handle both YYYY-MM-DD and full datetime formats
          const date = dateString.includes('T') 
            ? new Date(dateString) 
            : new Date(dateString + 'T00:00:00.000Z');
          
          // Validate the date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date provided:', dateString);
            return undefined;
          }
          
          return date.toISOString();
        } catch (error) {
          console.warn('Error formatting date:', dateString, error);
          return undefined;
        }
      };

      // Transform form data to match backend API structure
      const updateStudentData: Partial<CreateStudentRequest> = {
        // Basic student info
        firstName: data.firstName,
        lastName: data.lastName,
        admissionNumber: data.admissionNumber,
        bloodGroup: data.bloodGroup,
        category: data.category,
        religion: data.religion,
        admissionDate: formatDateToISO(data.admissionDate),
        dateOfBirth: formatDateToISO(data.dateOfBirth),
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
        
        // Address - use existing address structure if available
        address: student.address ? {
          ...student.address,
          // Update with any changes from the form
          ...(data.address ? { street: data.address } : {})
        } : {
          street: data.address
        },
        
        // Contact info - preserve existing contact structure
        contactInfo: {
          ...student.contactInfo,
          phone: data.phoneNumber,
          email: data.emailAddress,
        },
        
        // Class enrollment update
        classId: data.className,
        sectionId: data.sectionName,
        rollNumber: data.rollNumber,
      };
      
      // Update parent/guardian info if present
      if (data.fatherName || data.motherName || data.guardianName) {
        updateStudentData.parentInfo = {
          fatherName: data.fatherName || '',
          fatherPhone: data.fatherPhone,
          motherName: data.motherName || '',
          motherPhone: data.motherPhone,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianRelation: 'Other',
        };
      }

      // Call API to update student
      const result = await updateStudent(id, updateStudentData);
      
      if (result.success) {
        toast.success('Student updated successfully!');
        navigate(`/students/${id}`);
      } else {
        toast.error(result.message || 'Failed to update student. Please try again.');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching student data
  if (isLoadingStudent) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/students/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Student
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Student
            </h1>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter first name" />
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
                          <FormLabel className="font-medium">Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter last name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
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
                          <FormLabel className="font-medium">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Religion</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter religion" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="OBC">OBC</SelectItem>
                              <SelectItem value="SC">SC</SelectItem>
                              <SelectItem value="ST">ST</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadhaarNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Aadhaar Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter Aadhaar number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Class</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedClassId(value);
                              // Reset section when class changes
                              form.setValue('sectionName', '');
                            }} 
                            value={field.value}
                            disabled={classesStoreLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={classesStoreLoading ? "Loading classes..." : "Select class"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {!classesFromStore || classesFromStore.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  {classesStoreLoading ? "Loading classes..." : "No classes available"}
                                </div>
                              ) : (
                                classesFromStore.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.displayName || cls.grade}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sectionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Section</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedClassId || availableSections.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue 
                                  placeholder={
                                    !selectedClassId 
                                      ? "Select class first" 
                                      : availableSections.length === 0 
                                        ? "No sections available" 
                                        : "Select section"
                                  } 
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {!selectedClassId ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  Select class first
                                </div>
                              ) : availableSections.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  No sections available for selected class
                                </div>
                              ) : (
                                availableSections.map((section) => (
                                  <SelectItem key={section.id} value={section.id}>
                                    Section {section.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Roll Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter roll number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admissionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Admission Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter admission number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="admissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Admission Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter address" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="Enter email address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Parents/Guardians Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-orange-600" />
                    Parents/Guardians Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Father's Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Father's Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Father's name" />
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
                            <FormLabel className="font-medium">Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Father's phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Mother's Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Mother's Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mother's name" />
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
                            <FormLabel className="font-medium">Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mother's phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Guardian's Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Guardian's Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Guardian's name" />
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
                            <FormLabel className="font-medium">Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Guardian's phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guardianOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Guardian's occupation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditStudentPage;
