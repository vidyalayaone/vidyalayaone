// Edit teacher form page

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  User, 
  MapPin, 
  BookOpen, 
  Loader2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
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

import { getSchoolSubjects, getTeacherById, updateTeacher } from '@/api/api';
import { Subject, UpdateTeacherRequest, ProfileServiceTeacherDetail } from '@/api/types';

// Validation schema (matching backend updateTeacherSchema - all fields optional)
const updateTeacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  dateOfBirth: z.string().optional(),
  category: z.string().optional(),
  religion: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years').optional(),
  joiningDate: z.string().optional(),
  salary: z.number().min(0, 'Salary cannot be negative').optional(),
  subjectIds: z.array(z.string()).optional(),
  
  // Address fields (will be combined into address object)
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>;

const EditTeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacher, setTeacher] = useState<ProfileServiceTeacherDetail['teacher'] | null>(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateTeacherFormData>({
    resolver: zodResolver(updateTeacherSchema as any),
    defaultValues: {
      firstName: '',
      lastName: '',
      employeeId: '',
      gender: undefined,
      bloodGroup: '',
      maritalStatus: undefined,
      dateOfBirth: '',
      category: '',
      religion: '',
      qualifications: '',
      experienceYears: undefined,
      joiningDate: '',
      salary: undefined,
      subjectIds: [],
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    }
  });

  // Fetch teacher data and subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('Teacher ID is required');
        navigate('/teachers');
        return;
      }

      try {
        // Fetch teacher data and subjects in parallel
        const [teacherResponse, subjectsResponse] = await Promise.all([
          getTeacherById(id),
          getSchoolSubjects()
        ]);

        // Handle teacher data
        if (teacherResponse.success && teacherResponse.data?.teacher) {
          const teacherData = teacherResponse.data.teacher;
          setTeacher(teacherData);

          // Helper function to convert ISO datetime to date string for form inputs
          const convertToDateString = (dateString: string | undefined): string => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0]; // Get just the YYYY-MM-DD part
            } catch {
              return '';
            }
          };

          // Set form values with teacher data
          form.reset({
            firstName: teacherData.firstName || '',
            lastName: teacherData.lastName || '',
            employeeId: teacherData.employeeId || '',
            gender: teacherData.gender || undefined,
            bloodGroup: teacherData.bloodGroup || '',
            maritalStatus: teacherData.maritalStatus || undefined,
            dateOfBirth: convertToDateString(teacherData.dateOfBirth),
            category: teacherData.category || '',
            religion: teacherData.religion || '',
            qualifications: teacherData.qualifications || '',
            experienceYears: teacherData.experienceYears ? Number(teacherData.experienceYears) : undefined,
            joiningDate: convertToDateString(teacherData.joiningDate),
            salary: teacherData.salary ? Number(teacherData.salary) : undefined,
            street: teacherData.address?.street || '',
            city: teacherData.address?.city || '',
            state: teacherData.address?.state || '',
            postalCode: teacherData.address?.postalCode || '',
            country: teacherData.address?.country || '',
          });

          // Set selected subjects
          setSelectedSubjects(teacherData.subjectIds || []);
        } else {
          toast.error('Failed to load teacher data');
          navigate(`/teachers/${id}`);
        }

        // Handle subjects data
        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data.subjects);
        } else {
          toast.error('Failed to load subjects');
        }
      } catch (error) {
        toast.error('Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingTeacher(false);
        setIsLoadingSubjects(false);
      }
    };

    fetchData();
  }, [id, navigate, form]);

  // Helper function to convert date string to ISO datetime format
  const convertToDateTime = (dateString: string | undefined): string | undefined => {
    if (!dateString) return undefined;
    // Convert date string (YYYY-MM-DD) to ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
    const date = new Date(dateString + 'T00:00:00.000Z');
    return date.toISOString();
  };

  const onSubmit = async (data: UpdateTeacherFormData) => {
    if (!id) {
      toast.error('Teacher ID is required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Transform form data to match backend API
      const teacherData: UpdateTeacherRequest = {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        employeeId: data.employeeId || undefined,
        gender: data.gender,
        bloodGroup: data.bloodGroup || undefined,
        maritalStatus: data.maritalStatus,
        dateOfBirth: convertToDateTime(data.dateOfBirth),
        category: data.category || undefined,
        religion: data.religion || undefined,
        qualifications: data.qualifications || undefined,
        experienceYears: data.experienceYears,
        joiningDate: convertToDateTime(data.joiningDate),
        salary: data.salary,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        address: (data.street || data.city || data.state || data.postalCode || data.country) ? {
          street: data.street || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postalCode: data.postalCode || undefined,
          country: data.country || undefined,
        } : undefined,
      };

      console.log('Updating teacher:', teacherData);
      
      const response = await updateTeacher(id, teacherData);
      
      if (response.success && response.data) {
        toast.success('Teacher updated successfully!');
        navigate('/teachers');
      } else {
        toast.error(response.message || 'Failed to update teacher. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to update teacher. Please try again.');
      console.error('Error updating teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };

  // Update form validation when subjects change
  React.useEffect(() => {
    form.setValue('subjectIds', selectedSubjects);
  }, [selectedSubjects, form]);

  // Show loading state while fetching teacher data
  if (isLoadingTeacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading teacher data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Teacher not found</h2>
            <Button onClick={() => navigate(`/teachers/${id}`)}>
              Back to Teacher
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/teachers/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teacher
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Teacher</h1>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>Marital Status (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., General, OBC, SC, ST" {...field} />
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
                        <FormLabel>Religion (Optional)</FormLabel>
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

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address (Optional)</FormLabel>
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
                        <FormLabel>City (Optional)</FormLabel>
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
                        <FormLabel>State (Optional)</FormLabel>
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
                        <FormLabel>Postal Code (Optional)</FormLabel>
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
                        <FormLabel>Country (Optional)</FormLabel>
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
                        <FormLabel>Joining Date (Optional)</FormLabel>
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
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (in ₹ per month)(Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Enter salary amount"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., M.Sc. Mathematics, B.Ed." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Years) (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="50" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
                <p className="text-sm text-muted-foreground">Select the subjects this teacher can teach (optional)</p>
              </CardHeader>
              <CardContent>
                {isLoadingSubjects ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading subjects...</span>
                  </div>
                ) : subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
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
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No subjects available. Contact administrator to set up subjects.
                  </div>
                )}
                {form.formState.errors.subjectIds && (
                  <p className="text-sm text-destructive mt-2">{form.formState.errors.subjectIds.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/teachers')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Teacher
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

export default EditTeacherPage;
