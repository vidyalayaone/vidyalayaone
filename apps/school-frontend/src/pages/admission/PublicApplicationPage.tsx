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
  School
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
            <div className="flex items-center gap-3">
              <School className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">School Admission Application</h1>
                <p className="text-muted-foreground">Apply for admission to our school</p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
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

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
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
                              variant="ghost"
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
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form values:', form.getValues());
                }}
              >
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
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
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
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
