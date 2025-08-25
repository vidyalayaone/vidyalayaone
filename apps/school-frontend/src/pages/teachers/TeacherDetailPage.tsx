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
  Loader2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

import { Teacher, TeacherActivity } from '@/api/types';
import { getTeacherById } from '@/api/api';
import { transformProfileTeacherDetailToTeacher } from '@/utils/teacherTransform';
import { toast } from 'react-hot-toast';

// Mock activity data - will be replaced when backend supports activity tracking
const mockActivities: TeacherActivity[] = [
  {
    id: '1',
    teacherId: '1',
    type: 'LOGIN',
    description: 'Logged into the system',
    createdAt: '2024-08-11T08:30:00Z'
  },
  {
    id: '2',
    teacherId: '1',
    type: 'CLASS_ASSIGNED',
    description: 'Assigned to Grade 11 Section A - Physics',
    metadata: { className: 'Grade 11 Section A', subject: 'Physics' },
    createdAt: '2024-08-10T14:00:00Z'
  },
  {
    id: '3',
    teacherId: '1',
    type: 'PROFILE_UPDATED',
    description: 'Updated contact information',
    createdAt: '2024-08-09T10:15:00Z'
  },
  {
    id: '4',
    teacherId: '1',
    type: 'PASSWORD_RESET',
    description: 'Password was reset by admin',
    createdAt: '2024-08-08T16:45:00Z'
  },
  {
    id: '5',
    teacherId: '1',
    type: 'LOGIN',
    description: 'Logged into the system',
    createdAt: '2024-08-08T08:00:00Z'
  }
];

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities] = useState<TeacherActivity[]>(mockActivities);

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

  const handleResetPassword = () => {
    // Mock password reset
    const tempPassword = `Temp@${Math.random().toString(36).substring(2, 8)}`;
    toast.success(`Password reset successfully!\nNew temporary password: ${tempPassword}\nPlease share this with the teacher.`, {
      duration: 8000
    });
  };

  const handleDeleteTeacher = () => {
    // Mock delete - in real app would call API
    toast.success('Teacher deleted successfully');
    navigate('/teachers');
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

  const getActivityIcon = (type: TeacherActivity['type']) => {
    switch (type) {
      case 'LOGIN':
        return <User className="w-4 h-4" />;
      case 'CLASS_ASSIGNED':
      case 'CLASS_REMOVED':
        return <BookOpen className="w-4 h-4" />;
      case 'PROFILE_UPDATED':
        return <Edit className="w-4 h-4" />;
      case 'PASSWORD_RESET':
        return <Shield className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-foreground">Teacher Details</h1>
              <p className="text-muted-foreground">View and manage teacher information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Password
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link to={`/teachers/${teacher.id}/edit`}>
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the teacher
                    account and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeacher}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Teacher Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={teacher.avatar} alt={`${teacher.firstName} ${teacher.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(teacher.firstName, teacher.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{teacher.firstName} {teacher.lastName}</h2>
                    <Badge variant={teacher.isActive ? "default" : "secondary"}>
                      {teacher.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">{teacher.qualification}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                    <p className="font-mono">{teacher.employeeId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p>{teacher.experience} years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Joining Date</p>
                    <p>{formatDate(teacher.joiningDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p>{formatDate(teacher.dateOfBirth)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email !== 'N/A' ? teacher.email : 'Not available'}
                      </p>
                    </div>
                  </div>
                  {teacher.phoneNumber && teacher.phoneNumber !== 'N/A' && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{teacher.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.address.street !== 'N/A' ? (
                          <>
                            {teacher.address.street}<br />
                            {teacher.address.city}, {teacher.address.state} {teacher.address.postalCode}<br />
                            {teacher.address.country}
                          </>
                        ) : (
                          'Not available'
                        )}
                      </p>
                    </div>
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
                  <div>
                    <p className="text-sm font-medium">
                      {teacher.emergencyContact.name !== 'N/A' ? teacher.emergencyContact.name : 'Not specified'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.emergencyContact.relationship !== 'N/A' ? teacher.emergencyContact.relationship : 'Not specified'}
                    </p>
                  </div>
                  {teacher.emergencyContact.phoneNumber !== 'N/A' && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{teacher.emergencyContact.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  {teacher.emergencyContact.email && teacher.emergencyContact.email !== 'N/A' && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{teacher.emergencyContact.email}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subjects Teaching</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacher.subjects.length}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject.id} variant="secondary" className="text-xs">
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classes Assigned</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacher.classes.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {teacher.classes.filter(c => c.isClassTeacher).length} as Class Teacher
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacher.experience}</div>
                  <p className="text-xs text-muted-foreground mt-2">Years of Teaching</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Assignments</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Classes and subjects assigned to this teacher
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.classes.map((classAssignment) => (
                      <TableRow key={classAssignment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{classAssignment.className}</div>
                            <div className="text-sm text-muted-foreground">
                              Grade {classAssignment.grade} - Section {classAssignment.section}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {classAssignment.subject.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {classAssignment.isClassTeacher ? (
                            <Badge variant="default">Class Teacher</Badge>
                          ) : (
                            <Badge variant="outline">Subject Teacher</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="capitalize">{teacher.gender?.toLowerCase() || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                      <p>{teacher.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                      <p className="capitalize">{teacher.maritalStatus?.toLowerCase() || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{formatDate(teacher.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p>Not available</p> {/* Backend doesn't provide category in detail response */}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Religion</p>
                      <p>Not available</p> {/* Backend doesn't provide religion in detail response */}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                    <p>{teacher.qualification}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p>{teacher.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Joining Date</p>
                      <p>{formatDate(teacher.joiningDate)}</p>
                    </div>
                  </div>
                  {teacher.salary && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Salary</p>
                      <p>${teacher.salary.toLocaleString()} / year</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent activities and changes for this teacher
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</p>
                        </div>
                        {activity.metadata && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDetailPage;
