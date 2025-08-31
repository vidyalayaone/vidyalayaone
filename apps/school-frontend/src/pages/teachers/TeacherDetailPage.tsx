// Teacher detail view page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  Heart,
  User,
  Shield,
  Download,
  RotateCcw,
  Trash2,
  Loader2,
  GraduationCap
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

import { Teacher, TeacherActivity, DeleteTeachersRequest } from '@/api/types';
import { getTeacherById, deleteTeachers } from '@/api/api';
import { transformProfileTeacherDetailToTeacher } from '@/utils/teacherTransform';
import { toast } from 'react-hot-toast';

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch teacher data from API
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) {
        setError('Teacher ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getTeacherById(id);

        if (response.success && response.data) {
          const transformedTeacher = transformProfileTeacherDetailToTeacher(response.data);
          setTeacher(transformedTeacher);
        } else {
          setError(response.message || 'Failed to fetch teacher details');
        }
      } catch (err) {
        setError('Failed to fetch teacher details. Please try again.');
        console.error('Error fetching teacher:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  const handleDeleteTeacher = async () => {
    if (!teacher?.id) return;

    setIsDeleting(true);
    try {
      const deleteRequest: DeleteTeachersRequest = { teacherIds: [teacher.id] };
      const response = await deleteTeachers(deleteRequest);
      
      if (response.success && response.data) {
        const { summary } = response.data;
        
        if (summary.successfulDeletions > 0) {
          toast.success('Teacher deleted successfully');
          navigate('/teachers');
        } else {
          toast.error('Failed to delete teacher');
        }
      } else {
        toast.error(response.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') {
      return 'Not specified';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === 'N/A') {
      return 'Not specified';
    }
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading teacher details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-destructive">
              <User className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Error loading teacher</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Teacher not found state
  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">Teacher not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">The teacher you're looking for doesn't exist.</p>
            <Button 
              onClick={() => navigate('/teachers')} 
              className="mt-4"
              variant="outline"
            >
              Back to Teachers
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/teachers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teachers
          </Button>
        </div>

        {/* Header Section with Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">{teacher.firstName} {teacher.lastName}</h1>
              <Badge variant={teacher.isActive ? "default" : "secondary"} className={teacher.isActive ? "bg-green-100 text-green-800" : ""}>
                {teacher.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the teacher
                    <strong> {teacher.firstName} {teacher.lastName}</strong> and remove all associated data from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeacher}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Teacher'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Content Cards in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Field</TableHead>
                    <TableHead className="font-bold">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell className="font-medium">{teacher.firstName} {teacher.lastName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Employee ID</TableCell>
                    <TableCell className="font-medium">{teacher.employeeId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Date of Birth</TableCell>
                    <TableCell className="font-medium">{formatDate(teacher.dateOfBirth)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gender</TableCell>
                    <TableCell className="font-medium">{teacher.gender || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Blood Group</TableCell>
                    <TableCell className="font-medium">{teacher.bloodGroup || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Marital Status</TableCell>
                    <TableCell className="font-medium">{teacher.maritalStatus || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Category</TableCell>
                    <TableCell className="font-medium">{teacher.category || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Religion</TableCell>
                    <TableCell className="font-medium">{teacher.religion || 'Not specified'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Field</TableHead>
                    <TableHead className="font-bold">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Qualification</TableCell>
                    <TableCell className="font-medium">{teacher.qualification}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Experience</TableCell>
                    <TableCell className="font-medium">{teacher.experience} years</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Joining Date</TableCell>
                    <TableCell className="font-medium">{formatDate(teacher.joiningDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subjects Teaching</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject) => (
                          <Badge key={subject.id} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                  {teacher.salary && (
                    <TableRow>
                      <TableCell className="font-medium">Salary</TableCell>
                      <TableCell className="font-medium">₹{teacher.salary.toLocaleString()} per month</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Field</TableHead>
                    <TableHead className="font-bold">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell className="font-medium">
                      {teacher.email !== 'N/A' ? teacher.email : 'Not available'}
                    </TableCell>
                  </TableRow>
                  {teacher.phoneNumber && teacher.phoneNumber !== 'N/A' && (
                    <TableRow>
                      <TableCell className="font-medium">Phone Number</TableCell>
                      <TableCell className="font-medium">{teacher.phoneNumber}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Address</TableCell>
                    <TableCell className="font-medium">
                      {teacher.address.street !== 'N/A' ? (
                        <>
                          {teacher.address.street}<br />
                          {teacher.address.city}, {teacher.address.state} {teacher.address.postalCode}<br />
                          {teacher.address.country}
                        </>
                      ) : (
                        'Not available'
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDetailPage;
