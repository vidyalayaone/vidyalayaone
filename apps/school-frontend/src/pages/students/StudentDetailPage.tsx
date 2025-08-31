import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StudentFeesTab from '@/components/students/StudentFeesTab';
import { getStudentById, uploadStudentDocument, getStudentDocuments, deleteStudents } from '@/api/api';
import type { ProfileServiceStudent, UploadDocumentRequest, DeleteStudentsRequest, DeleteStudentsResponse } from '@/api/types';
import toast from 'react-hot-toast';

// Mock student data according to the new JSON shape
// This is now replaced by API call

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [student, setStudent] = useState<ProfileServiceStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ProfileServiceStudent['documents']>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<UploadDocumentRequest['type']>('OTHER');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Load documents for the student
  const loadDocuments = useCallback(async () => {
    if (!id) return;
    
    setDocumentsLoading(true);
    try {
      const response = await getStudentDocuments(id);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      } else {
        console.error('Failed to load documents:', response.message);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!selectedFile || !documentName || !id) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    setUploadingDocument(true);
    try {
      // Create document data for the upload
      const documentData: UploadDocumentRequest = {
        name: documentName,
        type: documentType,
        description: documentDescription || undefined,
      };

      const response = await uploadStudentDocument(id, selectedFile, documentData);
      if (response.success) {
        toast.success('Document uploaded successfully');
        setUploadDocumentDialogOpen(false);
        // Reset form
        setDocumentName('');
        setDocumentType('OTHER');
        setDocumentDescription('');
        setSelectedFile(null);
        // Reload documents
        loadDocuments();
      } else {
        toast.error(response.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
          // Load documents after student is loaded
          await loadDocuments();
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
  }, [id, navigate, loadDocuments]);

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
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAvatarUrl(student)} />
              <AvatarFallback className="text-lg">
                {getFullName(student).split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documents
                  </div>
                  <Button size="sm" onClick={() => setUploadDocumentDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Loading documents...</span>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            )}
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{doc.type.replace(/_/g, ' ')}</span>
                              {doc.isVerified && (
                                <Badge variant="outline" className="text-xs">Verified</Badge>
                              )}
                              {doc.expiryDate && (
                                <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
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

        {/* Upload Document Dialog */}
        <Dialog open={uploadDocumentDialogOpen} onOpenChange={setUploadDocumentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document for {student ? getFullName(student) : 'this student'}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-name">Document Name *</Label>
                <Input
                  id="document-name"
                  placeholder="e.g., Birth Certificate"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="document-type">Document Type *</Label>
                <Select value={documentType} onValueChange={(value: UploadDocumentRequest['type']) => setDocumentType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                    <SelectItem value="AADHAAR_CARD">Aadhaar Card</SelectItem>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                    <SelectItem value="MARK_SHEET">Mark Sheet</SelectItem>
                    <SelectItem value="TRANSFER_CERTIFICATE">Transfer Certificate</SelectItem>
                    <SelectItem value="CHARACTER_CERTIFICATE">Character Certificate</SelectItem>
                    <SelectItem value="MEDICAL_CERTIFICATE">Medical Certificate</SelectItem>
                    <SelectItem value="VACCINATION_RECORD">Vaccination Record</SelectItem>
                    <SelectItem value="PHOTO">Photo</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="document-description">Description</Label>
                <Textarea
                  id="document-description"
                  placeholder="Optional description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="document-upload">Select File *</Label>
                <Input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDocumentDialogOpen(false)} disabled={uploadingDocument}>
                Cancel
              </Button>
              <Button onClick={handleUploadDocument} disabled={uploadingDocument || !selectedFile || !documentName}>
                {uploadingDocument ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetailPage;
