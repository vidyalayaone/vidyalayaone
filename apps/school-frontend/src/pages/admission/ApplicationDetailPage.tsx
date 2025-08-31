import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  User, 
  GraduationCap, 
  Phone, 
  Users, 
  MapPin,
  Check,
  X,
  Calendar,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

import { 
  getStudentApplication, 
  acceptStudentApplication, 
  rejectStudentApplication 
} from '@/api/api';
import type { ProfileServiceStudent } from '@/api/types';
import { useClassesStore } from '@/store/classesStore';
import { useAuthStore } from '@/store/authStore';

// Form validation schema for accepting application
const acceptApplicationSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  rollNumber: z.string().optional(),
});

// Form validation schema for rejecting application
const rejectApplicationSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500, 'Reason is too long'),
});

type AcceptApplicationFormData = z.infer<typeof acceptApplicationSchema>;
type RejectApplicationFormData = z.infer<typeof rejectApplicationSchema>;

const ApplicationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<ProfileServiceStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Auth and classes store
  const { school } = useAuthStore();
  const classesFromStore = useClassesStore(state => state.classes);
  const fetchClassesAndSections = useClassesStore(state => state.fetchClassesAndSections);
  const classesStoreLoading = useClassesStore(state => state.isLoading);

  // Accept form
  const acceptForm = useForm<AcceptApplicationFormData>({
    resolver: zodResolver(acceptApplicationSchema as any),
    defaultValues: {
      admissionDate: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  // Reject form
  const rejectForm = useForm<RejectApplicationFormData>({
    resolver: zodResolver(rejectApplicationSchema as any),
  });

  // Fetch classes and sections for the current school
  useEffect(() => {
    if (!school?.id) return;
    fetchClassesAndSections(school.id, '2025-26').catch(console.error);
  }, [school?.id, fetchClassesAndSections]);

  // Get available sections for selected class
  const availableSections = React.useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classesFromStore.find(cls => cls.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classesFromStore]);

  // Fetch student application data
  useEffect(() => {
    const fetchStudentApplication = async () => {
      if (!id) {
        toast.error('Student ID not found');
        navigate('/admission/applications');
        return;
      }

      setIsLoading(true);
      try {
        const response = await getStudentApplication(id);
        if (response.success && response.data) {
          setStudent(response.data.student);
        } else {
          toast.error('Failed to load student application');
          navigate('/admission/applications');
        }
      } catch (error) {
        console.error('Error fetching student application:', error);
        toast.error('Failed to load student application');
        navigate('/admission/applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentApplication();
  }, [id, navigate]);

  // Helper functions for extracting student data
  const getContactPhone = (student: ProfileServiceStudent): string => {
    if (student.contactInfo?.phone) {
      return student.contactInfo.phone;
    }
    if (student.contactInfo?.primaryPhone) {
      return student.contactInfo.primaryPhone;
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
      sg.relation?.toLowerCase() !== 'father' && sg.relation?.toLowerCase() !== 'mother'
    );
    return guardianRelation?.guardian || null;
  };

  // Handle accept application
  const onAccept = async (data: AcceptApplicationFormData) => {
    if (!id || !student) {
      toast.error('Student ID not found');
      return;
    }

    setIsAccepting(true);
    try {
      const response = await acceptStudentApplication(id, {
        admissionNumber: data.admissionNumber,
        admissionDate: new Date(data.admissionDate).toISOString(),
        classId: data.classId,
        sectionId: data.sectionId,
        rollNumber: data.rollNumber,
      });

      if (response.success) {
        toast.success(response.data?.message || 'Student application accepted successfully!');
        navigate('/admission/applications');
      } else {
        toast.error(response.message || 'Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle reject application
  const onReject = async (data: RejectApplicationFormData) => {
    if (!id || !student) {
      toast.error('Student ID not found');
      return;
    }

    setIsRejecting(true);
    try {
      const response = await rejectStudentApplication(id, {
        reason: data.reason,
      });

      if (response.success) {
        toast.success(response.data?.message || 'Student application rejected successfully!');
        navigate('/admission/applications');
      } else {
        toast.error(response.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading student application...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Student application not found</p>
              <Button onClick={() => navigate('/admission/applications')}>
                Back to Applications
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const father = getFatherGuardian(student);
  const mother = getMotherGuardian(student);
  const guardian = getGuardian(student);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admission/applications')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Application Details
              </h1>
              <p className="text-muted-foreground">
                {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                student.status === 'PENDING' ? 'secondary' : 
                student.status === 'ACCEPTED' ? 'default' : 
                'destructive'
              }
            >
              {student.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Student Information */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="font-medium">{student.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="font-medium">{student.lastName}</p>
                  </div>
                </div>
                
                {student.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {student.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="font-medium">{student.gender}</p>
                    </div>
                  )}
                  {student.bloodGroup && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Blood Group</label>
                      <p className="font-medium">{student.bloodGroup}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {student.category && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="font-medium">{student.category}</p>
                    </div>
                  )}
                  {student.religion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Religion</label>
                      <p className="font-medium">{student.religion}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="font-medium">{getContactPhone(student) || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="font-medium">{getContactEmail(student) || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="font-medium">{getAddressString(student) || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Parents/Guardians Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Parents/Guardians Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Father's Information */}
                {father && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Father's Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="font-medium">{father.firstName} {father.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="font-medium">{father.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mother's Information */}
                {mother && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Mother's Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="font-medium">{mother.firstName} {mother.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="font-medium">{mother.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guardian's Information */}
                {guardian && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 border-b pb-1">Guardian's Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="font-medium">{guardian.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Action Forms */}
          <div className="space-y-6">
            {student.status === 'PENDING' && (
              <>
                {/* Accept Application Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Accept Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...acceptForm}>
                      <form onSubmit={acceptForm.handleSubmit(onAccept)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={acceptForm.control}
                            name="admissionNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admission Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter admission number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={acceptForm.control}
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={acceptForm.control}
                            name="classId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class *</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedClassId(value);
                                    acceptForm.setValue('sectionId', '');
                                  }}
                                  value={field.value}
                                  disabled={classesStoreLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={classesStoreLoading ? "Loading..." : "Select class"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {classesFromStore.map((cls) => (
                                      <SelectItem key={cls.id} value={cls.id}>
                                        {cls.displayName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={acceptForm.control}
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
                                    {availableSections.map((section) => (
                                      <SelectItem key={section.id} value={section.id}>
                                        Section {section.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={acceptForm.control}
                          name="rollNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Roll Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter roll number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={isAccepting}
                          className="w-full flex items-center gap-2"
                        >
                          {isAccepting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Accept Application
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Separator />

                {/* Reject Application */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Reject Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <X className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for rejecting this application. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Form {...rejectForm}>
                          <FormField
                            control={rejectForm.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rejection Reason *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter reason for rejection..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </Form>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={rejectForm.handleSubmit(onReject)}
                            disabled={isRejecting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isRejecting ? 'Rejecting...' : 'Reject Application'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </>
            )}

            {student.status !== 'PENDING' && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <Badge
                      variant={student.status === 'ACCEPTED' ? 'default' : 'destructive'}
                      className="text-lg px-4 py-2"
                    >
                      {student.status}
                    </Badge>
                    <p className="text-muted-foreground">
                      This application has already been {student.status.toLowerCase()}.
                    </p>
                    {student.admissionNumber && student.status === 'ACCEPTED' && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4" />
                          <span className="font-medium">Admission Number:</span>
                        </div>
                        <p className="text-lg font-mono">{student.admissionNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;
