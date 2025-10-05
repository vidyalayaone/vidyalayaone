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
  AlertTriangle,
  School,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { admissionAPI, mockFormData, type StudentData } from '@/api/mockAdmissionAPI';
import { createStudentApplication } from '@/api/api';
import type { CreateStudentApplicationRequest } from '@/api/types';

// Form validation schema
const publicApplicationSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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

type PublicApplicationFormData = z.infer<typeof publicApplicationSchema>;

const PublicApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<PublicApplicationFormData>({
    resolver: zodResolver(publicApplicationSchema as any),
    defaultValues: {
      gender: 'MALE',
      country: 'India',
    },
  });

  const onSubmit = async (data: PublicApplicationFormData) => {
    console.log('Form submission started with data:', data);
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
      const createStudentData: CreateStudentApplicationRequest = {
        // Basic student info
        firstName: data.firstName,
        lastName: data.lastName,
        bloodGroup: data.bloodGroup,
        category: data.category,
        religion: data.religion,
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
        
        // Documents (if any)
        documents: uploadedDocuments.map(doc => ({
          name: doc.name,
          type: 'OTHER', // Default type, can be enhanced later
          mimeType: doc.type,
          fileSize: doc.size,
          // Note: base64Data would need to be handled separately for actual file upload
        })),
      };

      const result = await createStudentApplication(createStudentData);
      
      if (result.success) {
        toast.success(result.message || 'Application submitted successfully! We will contact you soon.');
        // Show success dialog instead of directly navigating
        setShowSuccessDialog(true);
      } else {
        toast.error(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error creating student application:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/login');
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-accent/8 via-transparent to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-0" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-accent/60 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse delay-2000" />
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          {/* School Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">School Admission Application</h1>
            <p className="text-muted-foreground">Apply for admission to our school</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
            {/* Basic Information Section */}
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/10 rounded-3xl blur-xl transform rotate-1" />
              
              <Card className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-muted/5 to-muted/5 border-b border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="space-y-6 p-8">
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
              </CardContent>
            </Card>
            </div>

            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  This information will be used to contact you regarding the application
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
                          Used for application updates and communication
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
                          Primary contact number
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="h-12 px-6 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 rounded-2xl transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="relative h-12 px-6 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form values:', form.getValues());
                }}
              >
                <span className="relative flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <Save className="w-4 h-4 animate-pulse" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>
        </Form>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-green-600">
                Application Submitted Successfully! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Thank you for your application! We have received your submission and will contact you soon regarding the next steps in the admission process.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center">
              <AlertDialogAction 
                onClick={handleSuccessDialogClose}
                className="relative h-12 px-6 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PublicApplicationPage;