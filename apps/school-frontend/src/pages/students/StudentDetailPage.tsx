import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  DollarSign,
  GraduationCap,
  Users,
  ArrowLeft
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import StudentFeesTab from '@/components/students/StudentFeesTab';
import { getStudentById, deleteStudents } from '@/api/api';
import type { ProfileServiceStudent, DeleteStudentsRequest, DeleteStudentsResponse } from '@/api/types';
import toast from 'react-hot-toast';

// Mock student data according to the new JSON shape
// This is now replaced by API call

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [student, setStudent] = useState<ProfileServiceStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper functions for student data
  const getFullName = (student: ProfileServiceStudent): string => {
    return `${student.firstName} ${student.lastName}`.trim();
  };

  const getCurrentEnrollment = (student: ProfileServiceStudent) => {
    return student.enrollments.find(enrollment => enrollment.isCurrent) || null;
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

  const getContactPhone = (student: ProfileServiceStudent): string => {
    if (student.contactInfo?.phone) {
      return student.contactInfo.phone;
    }
    
    const father = getFatherGuardian(student);
    if (father?.phone) {
      return father.phone;
    }
    
    const mother = getMotherGuardian(student);
    if (mother?.phone) {
      return mother.phone;
    }
    
    return 'N/A';
  };

  const getContactEmail = (student: ProfileServiceStudent): string => {
    if (student.contactInfo?.email) {
      return student.contactInfo.email;
    }
    
    const father = getFatherGuardian(student);
    if (father?.email) {
      return father.email;
    }
    
    const mother = getMotherGuardian(student);
    if (mother?.email) {
      return mother.email;
    }
    
    return 'N/A';
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
      return parts.join(', ') || 'N/A';
    }
    return student.address || 'N/A';
  };

  const getAvatarUrl = (student: ProfileServiceStudent): string => {
    return student.profilePhoto || '/placeholder.svg';
  };

  // Check if we came from fees page and should open fees tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    // Check if URL path ends with /fees
    if (location.pathname.endsWith('/fees')) {
      setActiveTab('fees');
    }
  }, [location]);

  // Fetch student data based on ID
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await getStudentById(id);
        if (response.success && response.data) {
          setStudent(response.data.student);
        } else {
          toast.error('Student not found');
          navigate('/students');
        }
      } catch (error) {
        toast.error('Failed to load student data');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Student not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDeleteStudent = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const deleteRequest: DeleteStudentsRequest = { studentIds: [id] };
      const response = await deleteStudents(deleteRequest);
      
      if (response.success && response.data) {
        const { summary } = response.data;
        
        if (summary.successfulDeletions === summary.totalRequested) {
          toast.success('Student deleted successfully');
          navigate('/students');
        } else {
          toast.error('Failed to delete student');
        }
      } else {
        toast.error(response.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleMarkAsPaid = () => {
    console.log('Marking fee as paid for student:', id);
    // Here you would call the API to mark fee as paid
  };

  const getStatusBadge = () => {
    const currentEnrollment = getCurrentEnrollment(student);
    const status = currentEnrollment ? 'Active' : 'Inactive';
    if (status === 'Active') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getCurrentClassInfo = () => {
    const currentEnrollment = getCurrentEnrollment(student);
    if (currentEnrollment) {
      // Use className and sectionName if available, otherwise fallback to IDs
      const className = currentEnrollment.className || currentEnrollment.classId;
      const sectionName = currentEnrollment.sectionName || currentEnrollment.sectionId;
      return `${className} - ${sectionName}`;
    }
    return 'N/A';
  };

  const getCurrentRollNumber = () => {
    const currentEnrollment = getCurrentEnrollment(student);
    return currentEnrollment?.rollNumber || 'N/A';
  };

  const getFeeStatusBadge = () => {
    return <Badge variant="outline" className="border-blue-300 text-blue-800">Not Available</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </div>

        {/* Header Section with Photo and Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">{getFullName(student)}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/students/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
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
                        <TableCell className="font-medium">{getFullName(student)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Date of Birth</TableCell>
                        <TableCell className="font-medium">
                          {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Gender</TableCell>
                        <TableCell className="font-medium">{student.gender || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Religion</TableCell>
                        <TableCell className="font-medium">{student.religion || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Category</TableCell>
                        <TableCell className="font-medium">{student.category || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Blood Group</TableCell>
                        <TableCell className="font-medium">{student.bloodGroup || 'N/A'}</TableCell>
                      </TableRow>
                      {/* <TableRow>
                        <TableCell className="font-medium">Aadhaar Number</TableCell>
                        <TableCell className="font-medium">N/A</TableCell>
                      </TableRow> */}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Academic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Academic Information
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
                        <TableCell className="font-medium">Class</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const currentEnrollment = getCurrentEnrollment(student);
                            return currentEnrollment ? (currentEnrollment.className || currentEnrollment.classId) : 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Section</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const currentEnrollment = getCurrentEnrollment(student);
                            return currentEnrollment ? (currentEnrollment.sectionName || currentEnrollment.sectionId) : 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Roll Number</TableCell>
                        <TableCell className="font-medium">{getCurrentRollNumber()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Admission Number</TableCell>
                        <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Admission Date</TableCell>
                        <TableCell className="font-medium">{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                      </TableRow>
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
                        <TableCell className="font-medium">Address</TableCell>
                        <TableCell className="font-medium">{getAddressString(student)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Phone Number</TableCell>
                        <TableCell className="font-medium">{getContactPhone(student)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Email Address</TableCell>
                        <TableCell className="font-medium">{getContactEmail(student)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Parents/Guardians Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Parents/Guardians Information
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
                        <TableCell className="font-medium">Father's Name</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const father = getFatherGuardian(student);
                            return father ? `${father.firstName} ${father.lastName}` : 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Father's Phone Number</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const father = getFatherGuardian(student);
                            return father?.phone || 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      {/* <TableRow>
                        <TableCell className="font-medium">Father's Occupation</TableCell>
                        <TableCell className="font-medium">N/A</TableCell>
                      </TableRow> */}
                      <TableRow>
                        <TableCell className="font-medium">Mother's Name</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const mother = getMotherGuardian(student);
                            return mother ? `${mother.firstName} ${mother.lastName}` : 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mother's Phone Number</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const mother = getMotherGuardian(student);
                            return mother?.phone || 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      {/* <TableRow>
                        <TableCell className="font-medium">Mother's Occupation</TableCell>
                        <TableCell className="font-medium">N/A</TableCell>
                      </TableRow> */}
                      <TableRow>
                        <TableCell className="font-medium">Guardian's Name</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const otherGuardians = student.guardians.filter(sg => 
                              sg.relation?.toLowerCase() !== 'father' && sg.relation?.toLowerCase() !== 'mother'
                            );
                            if (otherGuardians.length > 0) {
                              const guardian = otherGuardians[0].guardian;
                              return `${guardian.firstName} ${guardian.lastName}`;
                            }
                            return 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Guardian's Phone Number</TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            const otherGuardians = student.guardians.filter(sg => 
                              sg.relation?.toLowerCase() !== 'father' && sg.relation?.toLowerCase() !== 'mother'
                            );
                            if (otherGuardians.length > 0) {
                              return otherGuardians[0].guardian.phone || 'N/A';
                            }
                            return 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                      {/* <TableRow>
                        <TableCell className="font-medium">Guardian's Occupation</TableCell>
                        <TableCell className="font-medium">N/A</TableCell>
                      </TableRow> */}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            <StudentFeesTab studentId={student.id} />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Attendance Charts Coming Soon</p>
                  <p className="text-sm text-muted-foreground">This section will display attendance analytics and charts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student
                <strong> {getFullName(student)}</strong> and remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetailPage;
