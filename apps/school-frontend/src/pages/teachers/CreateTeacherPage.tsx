// Create new teacher form page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Calendar,
  Shield,
  Heart,
  Users
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';

import { CreateTeacherData, Subject } from '@/api/types';

// Mock data for subjects and classes
const mockSubjects: Subject[] = [
  { id: 'math-1', name: 'Mathematics', code: 'MATH', description: 'Advanced Mathematics', isActive: true },
  { id: 'physics-1', name: 'Physics', code: 'PHY', description: 'General Physics', isActive: true },
  { id: 'chemistry-1', name: 'Chemistry', code: 'CHEM', description: 'Organic Chemistry', isActive: true },
  { id: 'biology-1', name: 'Biology', code: 'BIO', description: 'General Biology', isActive: true },
  { id: 'english-1', name: 'English', code: 'ENG', description: 'English Literature', isActive: true },
  { id: 'history-1', name: 'History', code: 'HIST', description: 'World History', isActive: true },
  { id: 'geography-1', name: 'Geography', code: 'GEO', description: 'Physical Geography', isActive: true },
  { id: 'computer-1', name: 'Computer Science', code: 'CS', description: 'Programming and IT', isActive: true }
];

const mockClasses = [
  { id: '6-A', name: 'Grade 6 Section A', grade: '6', section: 'A' },
  { id: '6-B', name: 'Grade 6 Section B', grade: '6', section: 'B' },
  { id: '7-A', name: 'Grade 7 Section A', grade: '7', section: 'A' },
  { id: '7-B', name: 'Grade 7 Section B', grade: '7', section: 'B' },
  { id: '8-A', name: 'Grade 8 Section A', grade: '8', section: 'A' },
  { id: '8-B', name: 'Grade 8 Section B', grade: '8', section: 'B' },
  { id: '9-A', name: 'Grade 9 Section A', grade: '9', section: 'A' },
  { id: '9-B', name: 'Grade 9 Section B', grade: '9', section: 'B' },
  { id: '10-A', name: 'Grade 10 Section A', grade: '10', section: 'A' },
  { id: '10-B', name: 'Grade 10 Section B', grade: '10', section: 'B' },
  { id: '11-A', name: 'Grade 11 Section A', grade: '11', section: 'A' },
  { id: '11-B', name: 'Grade 11 Section B', grade: '11', section: 'B' },
  { id: '12-A', name: 'Grade 12 Section A', grade: '12', section: 'A' },
  { id: '12-B', name: 'Grade 12 Section B', grade: '12', section: 'B' }
];

// Validation schema
const createTeacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  qualification: z.string().min(5, 'Qualification must be at least 5 characters'),
  experience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
  subjectIds: z.array(z.string()).min(1, 'At least one subject must be selected'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
  
  // Address
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
  emergencyContactRelationship: z.string().min(2, 'Relationship must be at least 2 characters'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
  emergencyContactEmail: z.union([z.string().email('Invalid emergency contact email'), z.literal('')]).optional()
});

type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;

const CreateTeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classAssignments, setClassAssignments] = useState<{ classId: string; subjectId: string; isClassTeacher: boolean }[]>([]);

  const form = useForm<CreateTeacherFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      employeeId: '',
      joiningDate: '',
      qualification: '',
      experience: 0,
      subjectIds: [],
      dateOfBirth: '',
      gender: 'MALE',
      bloodGroup: '',
      maritalStatus: 'SINGLE',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      emergencyContactEmail: ''
    }
  });

  const onSubmit = async (data: CreateTeacherFormData) => {
    try {
      // Generate username and temporary password
      const username = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`;
      const tempPassword = `Temp@${Math.random().toString(36).substring(2, 8)}`;

      const teacherData: CreateTeacherData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        employeeId: data.employeeId,
        joiningDate: data.joiningDate,
        qualification: data.qualification,
        experience: data.experience,
        subjectIds: selectedSubjects,
        classAssignments: classAssignments,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country
        },
        emergencyContact: {
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelationship,
          phoneNumber: data.emergencyContactPhone,
          email: data.emergencyContactEmail || undefined
        },
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || undefined,
        maritalStatus: data.maritalStatus
      };

      // Mock API call - in real implementation, this would call the actual API
      console.log('Creating teacher:', teacherData);
      
      // Show success message with credentials
      toast.success(
        `Teacher created successfully!\nUsername: ${username}\nTemporary Password: ${tempPassword}\nPlease share these credentials with the teacher.`,
        { duration: 8000 }
      );
      
      navigate('/teachers');
    } catch (error) {
      toast.error('Failed to create teacher. Please try again.');
    }
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
      // Remove class assignments for this subject
      setClassAssignments(prev => prev.filter(assignment => assignment.subjectId !== subjectId));
    }
  };

  const handleClassAssignment = (classId: string, subjectId: string, isClassTeacher: boolean) => {
    setClassAssignments(prev => {
      const existing = prev.find(a => a.classId === classId && a.subjectId === subjectId);
      if (existing) {
        return prev.map(a => 
          a.classId === classId && a.subjectId === subjectId 
            ? { ...a, isClassTeacher }
            : a
        );
      } else {
        return [...prev, { classId, subjectId, isClassTeacher }];
      }
    });
  };

  const removeClassAssignment = (classId: string, subjectId: string) => {
    setClassAssignments(prev => prev.filter(a => !(a.classId === classId && a.subjectId === subjectId)));
  };

  // Update form validation when subjects change
  React.useEffect(() => {
    form.setValue('subjectIds', selectedSubjects);
  }, [selectedSubjects, form]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/teachers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teachers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Teacher</h1>
            <p className="text-muted-foreground">Add a new teacher to the school staff</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group (Optional)</FormLabel>
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
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="MARRIED">Married</SelectItem>
                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="teacher@school.edu" {...field} />
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
                          <Input placeholder="+1-555-0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                          <Input placeholder="State" {...field} />
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
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
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
                          <Input placeholder="Country" {...field} />
                        </FormControl>
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
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spouse, Parent, Sibling" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0123" {...field} />
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
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="joiningDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Joining Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., M.Sc. Mathematics, B.Ed." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="50" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <p className="text-sm text-muted-foreground">Select the subjects this teacher can teach</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={subject.id} className="flex-1">
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground">{subject.code}</div>
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.subjectIds && (
                  <p className="text-sm text-destructive mt-2">{form.formState.errors.subjectIds.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Class Assignments */}
            {selectedSubjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Class Assignments</CardTitle>
                  <p className="text-sm text-muted-foreground">Assign classes and subjects to this teacher</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockClasses.map((class_) => (
                    <div key={class_.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{class_.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedSubjects.map((subjectId) => {
                          const subject = mockSubjects.find(s => s.id === subjectId);
                          const assignment = classAssignments.find(a => a.classId === class_.id && a.subjectId === subjectId);
                          
                          return (
                            <div key={`${class_.id}-${subjectId}`} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${class_.id}-${subjectId}`}
                                  checked={!!assignment}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleClassAssignment(class_.id, subjectId, false);
                                    } else {
                                      removeClassAssignment(class_.id, subjectId);
                                    }
                                  }}
                                />
                                <Label htmlFor={`${class_.id}-${subjectId}`}>
                                  {subject?.name}
                                </Label>
                              </div>
                              {assignment && (
                                <div className="ml-6">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${class_.id}-${subjectId}-class-teacher`}
                                      checked={assignment.isClassTeacher}
                                      onCheckedChange={(checked) => 
                                        handleClassAssignment(class_.id, subjectId, checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${class_.id}-${subjectId}-class-teacher`} className="text-sm">
                                      Class Teacher
                                    </Label>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/teachers')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create Teacher
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreateTeacherPage;
