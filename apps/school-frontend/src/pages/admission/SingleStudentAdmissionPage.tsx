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
import { Separator } from '@/components/ui/separator';

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
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  category: z.string().optional(),
  religion: z.string().optional(),
  
  // Contact Info
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  
  // Parent/Guardian Info
  fatherName: z.string().min(1, 'Father name is required'),
  fatherPhone: z.string().optional(),
  motherName: z.string().min(1, 'Mother name is required'),
  motherPhone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelation: z.string().optional(),
  
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
          primaryPhone: data.phoneNumber,
          email: data.email,
        },
        
        // Parent/Guardian info
        parentInfo: {
          fatherName: data.fatherName,
          fatherPhone: data.fatherPhone,
          motherName: data.motherName,
          motherPhone: data.motherPhone,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianRelation: data.guardianRelation,
        },
        
        // Enrollment info
        classId: data.classId,
        sectionId: data.sectionId,
        academicYear: '2025-26', // Use constant value
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
              <h1 className="text-3xl font-bold">Manual Admission</h1>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                          </SelectContent>
                        </Select>
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

            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Main contact number (will be used for user account)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
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

            {/* Parents/Guardian Information Section */}
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