// Single student admission form

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  FileText,
  User,
  MapPin,
  Phone,
  Heart,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { admissionAPI, mockFormData, type StudentData } from '@/api/mockAdmissionAPI';
import { createStudent } from '@/api/api';
import type { CreateStudentRequest } from '@/api/types';
import { useAuthStore } from '@/store/authStore';
import { useClassesStore } from '@/store/classesStore';

// Form validation schema
const singleAdmissionSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  category: z.string().optional(),
  religion: z.string().optional(),
  
  // Contact Info
  email: z.string().email('Valid email is required'),
  primaryPhone: z.string().min(10, 'Phone number is required'),
  secondaryPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  
  // Parent/Guardian Info
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
  
  // Medical Info (optional)
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  healthInsurance: z.string().optional(),
  
  // Documents (optional)
  documents: z.array(z.any()).optional(),
});

type SingleAdmissionFormData = z.infer<typeof singleAdmissionSchema>;

const SingleStudentAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  // Auth and classes store
  const { school } = useAuthStore();
  const classesFromStore = useClassesStore(state => state.classes);
  const fetchClassesAndSections = useClassesStore(state => state.fetchClassesAndSections);
  const classesStoreLoading = useClassesStore(state => state.isLoading);

  // Fetch classes and sections for the current school
  React.useEffect(() => {
    if (!school?.id) return;
    fetchClassesAndSections(school.id, '2025-26').catch(console.error);
  }, [school?.id, fetchClassesAndSections]);

  // Show loading or error state if school is not available
  if (!school?.id) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">Loading school information...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we load your school details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get available sections for selected class
  const availableSections = React.useMemo(() => {
    if (!selectedClassId || !classesFromStore) return [];
    const selectedClass = classesFromStore.find(cls => cls.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classesFromStore]);

  const form = useForm<SingleAdmissionFormData>({
    resolver: zodResolver(singleAdmissionSchema as any),
    defaultValues: {
      gender: 'MALE',
      country: 'India',
      admissionDate: new Date().toISOString().split('T')[0], // Keep as YYYY-MM-DD for form input
      academicYear: '2025-26',
    },
  });

  const onSubmit = async (data: SingleAdmissionFormData) => {
    setIsSubmitting(true);
    
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
      const createStudentData: CreateStudentRequest = {
        // Basic student info
        firstName: data.firstName,
        lastName: data.lastName,
        admissionNumber: data.admissionNumber,
        bloodGroup: data.bloodGroup,
        category: data.category,
        religion: data.religion,
        admissionDate: formatDateToISO(data.admissionDate)!,
        dateOfBirth: formatDateToISO(data.dateOfBirth),
        gender: data.gender,
        
        // Address
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country,
        },
        
        // Contact info
        contactInfo: {
          primaryPhone: data.primaryPhone,
          secondaryPhone: data.secondaryPhone,
          email: data.email,
          emergencyContact: data.emergencyContact,
        },
        
        // Parent/Guardian info
        parentInfo: {
          fatherName: data.fatherName,
          fatherPhone: data.fatherPhone,
          fatherEmail: data.fatherEmail,
          fatherOccupation: data.fatherOccupation,
          motherName: data.motherName,
          motherPhone: data.motherPhone,
          motherEmail: data.motherEmail,
          motherOccupation: data.motherOccupation,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianEmail: data.guardianEmail,
          guardianRelation: data.guardianRelation,
        },
        
        // Medical info
        medicalInfo: {
          allergies: data.allergies,
          chronicConditions: data.chronicConditions,
          medications: data.medications,
          doctorName: data.doctorName,
          doctorPhone: data.doctorPhone,
          healthInsurance: data.healthInsurance,
        },
        
        // Enrollment info
        classId: data.classId,
        sectionId: data.sectionId,
        academicYear: data.academicYear,
        rollNumber: data.rollNumber,
        
        // Documents (if any)
        documents: uploadedDocuments.map(doc => ({
          name: doc.name,
          type: 'OTHER', // Default type, can be enhanced later
          mimeType: doc.type,
          fileSize: doc.size,
          // Note: base64Data would need to be handled separately for actual file upload
        })),
      };

      const result = await createStudent(createStudentData);
      
      if (result.success) {
        toast.success(result.message || 'Student admitted successfully!');
        navigate('/admission');
      } else {
        toast.error(result.message || 'Failed to admit student. Please try again.');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/admission');
  };

  const onDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = /(pdf|png|jpe?g|doc|docx)$/i.test(file.name);
        if (!isValidType) {
          toast.error(`${file.name}: Only PDF, JPG, PNG, DOC, or DOCX files are allowed`);
          return false;
        }
        return true;
      });
      
      setUploadedDocuments(prev => [...prev, ...validFiles]);
      form.setValue('documents', [...uploadedDocuments, ...validFiles]);
      e.target.value = ''; // Reset input
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(newDocs);
    form.setValue('documents', newDocs);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admission
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Single Student Admission</h1>
              <p className="text-muted-foreground">
                Add a new student with comprehensive information. A user account will be automatically created using the provided email and phone number.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </TabsTrigger>
                <TabsTrigger value="parents" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Parents/Guardian
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Medical Info
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} />
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
                              <Input placeholder="Enter last name" {...field} />
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
                            <FormLabel>Admission Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter admission number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Unique identifier for the student
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="admissionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admission Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
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
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockFormData.genders.map((gender) => (
                                  <SelectItem key={gender.value} value={gender.value}>
                                    {gender.label}
                                  </SelectItem>
                                ))}
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockFormData.bloodGroups.map((bg) => (
                                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category (e.g., General, OBC, SC, ST)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Religion</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter religion" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Class Assignment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class *</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedClassId(value);
                                  // Reset section when class changes
                                  form.setValue('sectionId', '');
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
                          name="sectionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section *</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="academicYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Year *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter academic year (e.g., 2025-26)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rollNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Roll Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter roll number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional: Will be assigned if not provided
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      Email and phone number will be used to automatically create a user account
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormDescription>
                              Used for both user account login and communication
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter primary phone number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Main contact number (will be used for user account)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter secondary phone number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Alternative contact number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter emergency contact number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Emergency contact phone number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter complete street address"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
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
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PIN code" {...field} />
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
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Parents/Guardian Tab */}
              <TabsContent value="parents">
                <div className="space-y-6">
                  {/* Father Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Father's Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Father's Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter father's name" {...field} />
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
                              <FormLabel>Father's Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter father's phone number" {...field} />
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
                              <FormLabel>Father's Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter father's email" {...field} />
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
                              <FormLabel>Father's Occupation</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter father's occupation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mother Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Mother's Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mother's Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mother's name" {...field} />
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
                              <FormLabel>Mother's Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mother's phone number" {...field} />
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
                              <FormLabel>Mother's Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter mother's email" {...field} />
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
                              <FormLabel>Mother's Occupation</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mother's occupation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guardian Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Guardian Information (If Different)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardianName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter guardian's name" {...field} />
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
                              <FormLabel>Guardian's Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter guardian's phone number" {...field} />
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
                              <FormLabel>Guardian's Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter guardian's email" {...field} />
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
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockFormData.guardianRelations.map((relation) => (
                                    <SelectItem key={relation.value} value={relation.value}>
                                      {relation.label}
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
                </div>
              </TabsContent>

              {/* Medical Information Tab */}
              <TabsContent value="medical">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      This information is important for student safety and care
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any known allergies"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include food, drug, or environmental allergies
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
                                placeholder="List any chronic medical conditions"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include asthma, diabetes, epilepsy, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List current medications and dosages"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include prescription and over-the-counter medications
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
                              <Input placeholder="Enter primary doctor's name" {...field} />
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
                              <Input placeholder="Enter doctor's phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="healthInsurance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health Insurance</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter health insurance details" {...field} />
                            </FormControl>
                            <FormDescription>
                              Insurance provider and policy number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      Upload relevant documents for the student admission (Optional)
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Documents */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          You can upload academic records, certificates, identity proofs, and other relevant documents. Accepted formats: PDF, JPG, PNG, DOC, DOCX
                        </p>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" 
                            onChange={onDocumentUpload}
                            multiple
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Select Files
                          </Button>
                        </div>
                      </div>

                      {/* Uploaded Documents List */}
                      {uploadedDocuments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Documents ({uploadedDocuments.length})</h4>
                          <div className="space-y-2">
                            {uploadedDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Document Guidelines */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Document Guidelines</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Academic transcripts and certificates</li>
                          <li>• Birth certificate or age proof</li>
                          <li>• Identity proof (Aadhar card, passport, etc.)</li>
                          <li>• Address proof</li>
                          <li>• Previous school transfer certificate (if applicable)</li>
                          <li>• Medical certificates (if any)</li>
                          <li>• Passport-size photographs</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Admitting Student...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Admit Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default SingleStudentAdmissionPage;
