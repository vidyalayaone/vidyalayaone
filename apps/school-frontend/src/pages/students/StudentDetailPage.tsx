// Student detail view page

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
  Users
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
import { getStudentById, createStudentDocument, getStudentDocuments } from '@/api/api';
import type { ProfileServiceStudent, CreateDocumentRequest } from '@/api/types';
import toast from 'react-hot-toast';

// Mock student data according to the new JSON shape
// This is now replaced by API call

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [student, setStudent] = useState<ProfileServiceStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ProfileServiceStudent['documents']>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<CreateDocumentRequest['type']>('OTHER');
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

  // Handle file upload to a storage service (mock for now)
  const uploadFileToStorage = async (file: File): Promise<string> => {
    // For now, return a mock URL. In production, you'd upload to GCS/S3
    // and return the actual URL
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://storage.example.com/documents/${Date.now()}-${file.name}`);
      }, 1000);
    });
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!selectedFile || !documentName || !id) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    setUploadingDocument(true);
    try {
      // Upload file to storage first
      const fileUrl = await uploadFileToStorage(selectedFile);
      
      // Create document record
      const documentData: CreateDocumentRequest = {
        name: documentName,
        type: documentType,
        url: fileUrl,
        description: documentDescription || undefined,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      };

      const response = await createStudentDocument(id, documentData);
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

  const handleDeactivateStudent = () => {
    console.log('Deactivating student:', id);
    // Here you would call the API to deactivate the student
    navigate('/students');
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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <span>→</span>
          <span 
            className="cursor-pointer hover:text-foreground"
            onClick={() => navigate('/students')}
          >
            Students
          </span>
          <span>→</span>
          <span className="text-foreground font-medium">{getFullName(student)}</span>
        </div>

        {/* Header Section with Photo and Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAvatarUrl(student)} />
              <AvatarFallback className="text-lg">
                {getFullName(student).split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold tracking-tight">{getFullName(student)}</h1>
                {getStatusBadge()}
              </div>
              {/* <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>Admission No: <span className="font-medium text-foreground">{student.admissionNumber}</span></span>
                <span>Student ID: <span className="font-medium text-foreground">{student.id}</span></span>
                <span>Class: <span className="font-medium text-foreground">{getCurrentClassInfo()}</span></span>
              </div> */}
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
              onClick={() => setDeactivateDialogOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          </div>
        </div>

        {/* Profile Summary Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roll No</p>
                <p className="text-lg font-semibold">{getCurrentRollNumber()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class</p>
                <p className="text-lg font-semibold">{getCurrentClassInfo()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fee Status</p>
                <div>{getFeeStatusBadge()}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                <p>{new Date(student.admissionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-sm">{getContactPhone(student)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="marks">Marks</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Roll No</p>
                      <p className="text-lg">{getCurrentRollNumber()}</p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                      <p className="text-lg">{student.id}</p>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Admission No</p>
                      <p className="text-lg">{student.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Class</p>
                      <p className="text-lg">{getCurrentClassInfo()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                      <p>{new Date(student.admissionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {getContactEmail(student)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {getContactPhone(student)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      {getAddressString(student)}
                    </p>
                  </div>
                  {student.gender && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p>{student.gender}</p>
                    </div>
                  )}
                  {student.bloodGroup && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                      <p>{student.bloodGroup}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guardian Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Parents / Guardians
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const father = getFatherGuardian(student);
                      const mother = getMotherGuardian(student);
                      
                      return (
                        <>
                          {father && (
                            <div className="border rounded-lg p-3">
                              <p className="text-sm font-medium text-muted-foreground">Father</p>
                              <p className="font-medium">{`${father.firstName} ${father.lastName}`}</p>
                              {father.phone && (
                                <p className="text-sm">{father.phone}</p>
                              )}
                              {father.email && (
                                <p className="text-sm text-muted-foreground">{father.email}</p>
                              )}
                            </div>
                          )}

                          {mother && (
                            <div className="border rounded-lg p-3">
                              <p className="text-sm font-medium text-muted-foreground">Mother</p>
                              <p className="font-medium">{`${mother.firstName} ${mother.lastName}`}</p>
                              {mother.phone && (
                                <p className="text-sm">{mother.phone}</p>
                              )}
                              {mother.email && (
                                <p className="text-sm text-muted-foreground">{mother.email}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Show other guardians */}
                          {student.guardians
                            .filter(sg => sg.relation?.toLowerCase() !== 'father' && sg.relation?.toLowerCase() !== 'mother')
                            .map((sg) => (
                              <div key={sg.id} className="border rounded-lg p-3">
                                <p className="text-sm font-medium text-muted-foreground">{sg.relation || 'Guardian'}</p>
                                <p className="font-medium">{`${sg.guardian.firstName} ${sg.guardian.lastName}`}</p>
                                {sg.guardian.phone && (
                                  <p className="text-sm">{sg.guardian.phone}</p>
                                )}
                                {sg.guardian.email && (
                                  <p className="text-sm text-muted-foreground">{sg.guardian.email}</p>
                                )}
                              </div>
                            ))
                          }
                          
                          {student.guardians.length === 0 && (
                            <div className="col-span-2 text-center py-4 text-muted-foreground">
                              No guardian information available
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {student.dateOfBirth && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {student.gender && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p>{student.gender}</p>
                      </div>
                    )}
                    {student.bloodGroup && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                        <p>{student.bloodGroup}</p>
                      </div>
                    )}
                    {student.category && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p>{student.category}</p>
                      </div>
                    )}
                    {student.religion && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Religion</p>
                        <p>{student.religion}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transport Info Card - Commented out as it's not in the new schema */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Transport Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Route</p>
                    <p>{student.transport.route}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pickup Point</p>
                    <p>{student.transport.pickup}</p>
                  </div>
                </CardContent>
              </Card> */}
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

          {/* Marks Tab */}
          <TabsContent value="marks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Marks & Grades Coming Soon</p>
                  <p className="text-sm text-muted-foreground">This section will display subject-wise marks and performance analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Timeline */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.activity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 border-l-2 border-muted pl-4">
                  <div className="w-2 h-2 bg-primary rounded-full -ml-5 border-2 border-background"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.event}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will deactivate the student <strong>{getFullName(student)}</strong>. 
                The student will not be able to access the system until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateStudent}
                className="bg-red-600 hover:bg-red-700"
              >
                Deactivate Student
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
                <Select value={documentType} onValueChange={(value: CreateDocumentRequest['type']) => setDocumentType(value)}>
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
