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

import { admissionAPI, mockFormData, type StudentData } from '@/api/mockAdmissionAPI';

// Form validation schema
const singleAdmissionSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  classId: z.string().min(1, 'Class is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().min(1, 'Section is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  
  // Contact Info
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  // Address
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  
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

type SingleAdmissionFormData = z.infer<typeof singleAdmissionSchema>;

const SingleStudentAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SingleAdmissionFormData>({
    resolver: zodResolver(singleAdmissionSchema as any),
    defaultValues: {
      gender: 'MALE',
      country: 'India',
      enrollmentDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: SingleAdmissionFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await admissionAPI.admitSingleStudent(data as StudentData);
      
      if (result.success) {
        toast.success(result.message);
        navigate('/admission');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/admission');
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
                Add a new student with comprehensive information
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
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
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter student ID" {...field} />
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
                        name="enrollmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment Date *</FormLabel>
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
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Class Assignment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockFormData.classes.map((cls) => (
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

                        <FormField
                          control={form.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockFormData.grades.map((grade) => (
                                    <SelectItem key={grade} value={grade}>
                                      Grade {grade}
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
                          name="section"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockFormData.sections.map((section) => (
                                    <SelectItem key={section} value={section}>
                                      Section {section}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Student's email for communication
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Student's mobile number
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
                          <FormLabel>Street Address *</FormLabel>
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
                            <FormLabel>City *</FormLabel>
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
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
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
                              <Input placeholder="Enter postal code" {...field} />
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

                  {/* Emergency Contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter emergency contact name" {...field} />
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
                                <Input placeholder="Enter relationship" {...field} />
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
                              <FormLabel>Emergency Contact Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter emergency contact phone" {...field} />
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
                              <FormLabel>Emergency Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter emergency contact email" {...field} />
                              </FormControl>
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
