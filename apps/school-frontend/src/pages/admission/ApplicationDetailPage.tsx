// Individual Admission Application Review Page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Download, 
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Save,
  Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { AdmissionApplication, applicationAPI } from '@/api/mockAdmissionApplicationAPI';
import { StudentData } from '@/api/mockAdmissionAPI';

const reviewSchema = z.object({
  reviewNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Form for student data editing
  const studentForm = useForm<StudentData>({
    defaultValues: {}
  });

  // Form for review notes
  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema as any),
    defaultValues: {
      reviewNotes: '',
      rejectionReason: ''
    }
  });

  // Load application
  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const app = await applicationAPI.getApplicationById(id);
        if (app) {
          setApplication(app);
          studentForm.reset(app.studentData);
          reviewForm.reset({
            reviewNotes: app.reviewNotes || '',
            rejectionReason: app.rejectionReason || ''
          });
        } else {
          toast.error('Application not found');
          navigate('/admission/applications');
        }
      } catch (error) {
        console.error('Error loading application:', error);
        toast.error('Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [id, navigate, studentForm, reviewForm]);

  const handleSaveStudentData = async () => {
    if (!application) return;

    setSaving(true);
    try {
      const formData = studentForm.getValues();
      const updatedApp = await applicationAPI.updateApplicationData(application.id, formData);
      setApplication(updatedApp);
      setEditing(false);
      toast.success('Student data updated successfully');
    } catch (error) {
      console.error('Error updating student data:', error);
      toast.error('Failed to update student data');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;

    setSaving(true);
    try {
      const reviewData = reviewForm.getValues();
      const updatedApp = await applicationAPI.updateApplicationStatus(
        application.id, 
        'APPROVED',
        reviewData.reviewNotes
      );
      setApplication(updatedApp);
      setApproveDialogOpen(false);
      toast.success('Application approved successfully');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;

    const reviewData = reviewForm.getValues();
    if (!reviewData.rejectionReason?.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setSaving(true);
    try {
      const updatedApp = await applicationAPI.updateApplicationStatus(
        application.id, 
        'REJECTED',
        reviewData.reviewNotes,
        reviewData.rejectionReason
      );
      setApplication(updatedApp);
      setRejectDialogOpen(false);
      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setSaving(false);
    }
  };

  const handleStartReview = async () => {
    if (!application) return;

    try {
      const updatedApp = await applicationAPI.updateApplicationStatus(
        application.id, 
        'UNDER_REVIEW'
      );
      setApplication(updatedApp);
      toast.success('Application moved to under review');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-800 bg-orange-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-800 bg-yellow-50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="border-green-300 text-green-800 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="border-red-300 text-red-800 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Application not found</p>
            <Button onClick={() => navigate('/admission/applications')} className="mt-4">
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admission/applications')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Application {application.applicationNumber}
              </h1>
              <p className="text-muted-foreground">
                Submitted {formatDate(application.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(application.status)}
          </div>
        </div>

        {/* Action Buttons */}
        {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Review Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Take action on this admission application
                  </p>
                </div>
                <div className="flex space-x-2">
                  {application.status === 'PENDING' && (
                    <Button 
                      variant="outline" 
                      onClick={handleStartReview}
                      disabled={saving}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Start Review
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={saving}
                    className="border-green-300 text-green-800 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={saving}
                    className="border-red-300 text-red-800 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="student-info">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="student-info">Student Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="student-info" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(!editing)}
                      disabled={application.status === 'APPROVED' || application.status === 'REJECTED'}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {editing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-lg">
                          {application.studentData.firstName[0]}{application.studentData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {application.studentData.firstName} {application.studentData.lastName}
                        </h3>
                        <p className="text-muted-foreground">
                          Grade {application.studentData.grade}, Section {application.studentData.section}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        {editing ? (
                          <Input 
                            {...studentForm.register('firstName')}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">{application.studentData.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        {editing ? (
                          <Input 
                            {...studentForm.register('lastName')}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">{application.studentData.lastName}</p>
                        )}
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        {editing ? (
                          <Input 
                            type="date"
                            {...studentForm.register('dateOfBirth')}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">{application.studentData.dateOfBirth}</p>
                        )}
                      </div>
                      <div>
                        <Label>Gender</Label>
                        {editing ? (
                          <Select 
                            value={studentForm.watch('gender')}
                            onValueChange={(value) => studentForm.setValue('gender', value as any)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">{application.studentData.gender}</p>
                        )}
                      </div>
                      <div>
                        <Label>Blood Group</Label>
                        {editing ? (
                          <Input 
                            {...studentForm.register('bloodGroup')}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">{application.studentData.bloodGroup || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <Label>Grade</Label>
                        {editing ? (
                          <Select 
                            value={studentForm.watch('grade')}
                            onValueChange={(value) => studentForm.setValue('grade', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9">Grade 9</SelectItem>
                              <SelectItem value="10">Grade 10</SelectItem>
                              <SelectItem value="11">Grade 11</SelectItem>
                              <SelectItem value="12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 p-2 bg-muted rounded">Grade {application.studentData.grade}</p>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveStudentData} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Student Contact */}
                    <div>
                      <h4 className="font-semibold mb-3">Student Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p>{application.studentData.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p>{application.studentData.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parents Contact */}
                    <div>
                      <h4 className="font-semibold mb-3">Parents/Guardian</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Father</h5>
                          <div className="space-y-2">
                            <p><strong>Name:</strong> {application.studentData.fatherName}</p>
                            <p><strong>Phone:</strong> {application.studentData.fatherPhone || 'N/A'}</p>
                            <p><strong>Email:</strong> {application.studentData.fatherEmail || 'N/A'}</p>
                            <p><strong>Occupation:</strong> {application.studentData.fatherOccupation || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Mother</h5>
                          <div className="space-y-2">
                            <p><strong>Name:</strong> {application.studentData.motherName}</p>
                            <p><strong>Phone:</strong> {application.studentData.motherPhone || 'N/A'}</p>
                            <p><strong>Email:</strong> {application.studentData.motherEmail || 'N/A'}</p>
                            <p><strong>Occupation:</strong> {application.studentData.motherOccupation || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="font-semibold mb-3">Address</h4>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p>{application.studentData.street}</p>
                          <p>{application.studentData.city}, {application.studentData.state} {application.studentData.postalCode}</p>
                          <p>{application.studentData.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h4 className="font-semibold mb-3">Emergency Contact</h4>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {application.studentData.emergencyContactName}</p>
                        <p><strong>Relation:</strong> {application.studentData.emergencyContactRelation}</p>
                        <p><strong>Phone:</strong> {application.studentData.emergencyContactPhone}</p>
                        <p><strong>Email:</strong> {application.studentData.emergencyContactEmail || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents ({application.documents.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No documents uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {application.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.type.replace('_', ' ')} • Uploaded {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="reviewNotes">Review Notes</Label>
                      <Textarea
                        id="reviewNotes"
                        placeholder="Add notes about this application..."
                        {...reviewForm.register('reviewNotes')}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    {application.status === 'REJECTED' && (
                      <div>
                        <Label htmlFor="rejectionReason">Rejection Reason</Label>
                        <Textarea
                          id="rejectionReason"
                          placeholder="Reason for rejection..."
                          {...reviewForm.register('rejectionReason')}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    )}

                    {application.reviewedAt && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Reviewed by:</strong> {application.reviewedBy}
                        </p>
                        <p className="text-sm">
                          <strong>Reviewed on:</strong> {formatDate(application.reviewedAt)}
                        </p>
                        {application.reviewNotes && (
                          <p className="text-sm mt-2">
                            <strong>Notes:</strong> {application.reviewNotes}
                          </p>
                        )}
                        {application.rejectionReason && (
                          <p className="text-sm mt-2">
                            <strong>Rejection Reason:</strong> {application.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application Number</p>
                  <p className="font-medium">{application.applicationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(application.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant={application.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                    {application.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <Badge variant="outline">{application.source.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{application.submittedBy.name}</p>
                  <p className="text-sm">{application.submittedBy.type}</p>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            {(application.studentData.allergies || application.studentData.chronicConditions || application.studentData.medications) && (
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application.studentData.allergies && (
                    <div>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                      <p className="text-sm">{application.studentData.allergies}</p>
                    </div>
                  )}
                  {application.studentData.chronicConditions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Chronic Conditions</p>
                      <p className="text-sm">{application.studentData.chronicConditions}</p>
                    </div>
                  )}
                  {application.studentData.medications && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medications</p>
                      <p className="text-sm">{application.studentData.medications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Approval Dialog */}
        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this admission application for{' '}
                <strong>{application.studentData.firstName} {application.studentData.lastName}</strong>?
                This will add the student to the school system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={saving}
              >
                {saving ? 'Approving...' : 'Approve Application'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rejection Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this admission application for{' '}
                <strong>{application.studentData.firstName} {application.studentData.lastName}</strong>?
                Please provide a reason for rejection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4">
              <Label htmlFor="rejectionReasonDialog">Rejection Reason (Required)</Label>
              <Textarea
                id="rejectionReasonDialog"
                placeholder="Please provide a clear reason for rejection..."
                {...reviewForm.register('rejectionReason')}
                className="mt-1"
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
                disabled={saving}
              >
                {saving ? 'Rejecting...' : 'Reject Application'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;
