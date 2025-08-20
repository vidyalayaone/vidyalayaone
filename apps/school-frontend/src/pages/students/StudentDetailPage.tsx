// Student detail view page

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Mock student data according to the new JSON shape
const mockStudent = {
  id: "STU123",
  rollNo: "23",
  name: "John Doe",
  class: "6",
  section: "A",
  admissionDate: "2022-04-10",
  email: "john@example.com",
  phone: "+91-9876543210",
  address: "123 Main Street, City",
  status: "Active",
  feeStatus: "Pending",
  avatar: "/placeholder.svg",
  parentGuardian: {
    fatherName: 'Mike Doe',
    fatherPhone: '+91-9876500001',
    fatherEmail: 'mike.doe@example.com',
    fatherOccupation: 'Engineer',
    motherName: 'Jane Doe',
    motherPhone: '+91-9876500000',
    motherEmail: 'jane.doe@example.com',
    motherOccupation: 'Teacher'
  },
  transport: { route: 'Bus 5', pickup: 'Station Road' },
  documents: [
    { id: 1, name: "Birth Certificate", url: "#" },
    { id: 2, name: "Previous School TC", url: "#" },
    { id: 3, name: "Address Proof", url: "#" }
  ],
  fees: {
    structure: "Annual: 40,000 INR",
    nextDue: "2025-09-10",
    totalAmount: 40000,
    paidAmount: 30000,
    pendingAmount: 10000,
    history: [
      { date: "2025-04-10", amount: 10000, status: "Paid", method: "Online" },
      { date: "2025-06-10", amount: 10000, status: "Paid", method: "Cash" },
      { date: "2025-08-10", amount: 10000, status: "Paid", method: "Bank Transfer" }
    ]
  },
  activity: [
    { date: "2025-08-10", event: "Fee paid" },
    { date: "2025-08-15", event: "Document uploaded" },
    { date: "2025-08-18", event: "Attendance marked" }
  ]
};

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);

  // In a real app, you would fetch the student data based on the ID
  const student = mockStudent;

  const handleDeactivateStudent = () => {
    console.log('Deactivating student:', id);
    // Here you would call the API to deactivate the student
    navigate('/students');
  };

  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Uploading documents:', files);
    // Here you would call the API to upload documents
    setUploadDocumentDialogOpen(false);
  };

  const handleMarkAsPaid = () => {
    console.log('Marking fee as paid for student:', id);
    // Here you would call the API to mark fee as paid
  };

  const getStatusBadge = () => {
    if (student.status === 'Active') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getFeeStatusBadge = () => {
    switch (student.feeStatus) {
      case 'Paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Pending</Badge>;
      case 'Partial':
        return <Badge variant="outline" className="border-blue-300 text-blue-800">Partial</Badge>;
      case 'Overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
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
          <span className="text-foreground font-medium">{student.name}</span>
        </div>

        {/* Header Section with Photo and Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
                {getStatusBadge()}
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>Roll No: <span className="font-medium text-foreground">{student.rollNo}</span></span>
                <span>Student ID: <span className="font-medium text-foreground">{student.id}</span></span>
                <span>Class: <span className="font-medium text-foreground">{student.class} - {student.section}</span></span>
              </div>
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
                <p className="text-lg font-semibold">{student.rollNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class</p>
                <p className="text-lg font-semibold">{student.class} - {student.section}</p>
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
                <p className="text-sm">{student.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs defaultValue="basic" className="space-y-6">
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
                      <p className="text-lg">{student.rollNo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                      <p className="text-lg">{student.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Class</p>
                      <p className="text-lg">{student.class}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Section</p>
                      <p className="text-lg">{student.section}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                      <p>{new Date(student.admissionDate).toLocaleDateString()}</p>
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
                      {student.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {student.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      {student.address}
                    </p>
                  </div>
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
                    <div className="border rounded-lg p-3">
                      <p className="text-sm font-medium text-muted-foreground">Father</p>
                      <p className="font-medium">{student.parentGuardian.fatherName}</p>
                      {student.parentGuardian.fatherOccupation && (
                        <p className="text-sm text-muted-foreground">{student.parentGuardian.fatherOccupation}</p>
                      )}
                      {student.parentGuardian.fatherPhone && (
                        <p className="text-sm">{student.parentGuardian.fatherPhone}</p>
                      )}
                      {student.parentGuardian.fatherEmail && (
                        <p className="text-sm text-muted-foreground">{student.parentGuardian.fatherEmail}</p>
                      )}
                    </div>

                    <div className="border rounded-lg p-3">
                      <p className="text-sm font-medium text-muted-foreground">Mother</p>
                      <p className="font-medium">{student.parentGuardian.motherName}</p>
                      {student.parentGuardian.motherOccupation && (
                        <p className="text-sm text-muted-foreground">{student.parentGuardian.motherOccupation}</p>
                      )}
                      {student.parentGuardian.motherPhone && (
                        <p className="text-sm">{student.parentGuardian.motherPhone}</p>
                      )}
                      {student.parentGuardian.motherEmail && (
                        <p className="text-sm text-muted-foreground">{student.parentGuardian.motherEmail}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transport Info Card */}
              <Card>
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
                {student.documents.length > 0 ? (
                  <div className="space-y-3">
                    {student.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Fee Status
                  </div>
                  <Button size="sm" onClick={handleMarkAsPaid}>
                    Mark as Paid
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fee Structure</p>
                    <p className="text-lg font-bold">{student.fees.structure}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                    <p className="text-lg font-bold text-green-600">₹{student.fees.paidAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                    <p className="text-lg font-bold text-red-600">₹{student.fees.pendingAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getFeeStatusBadge()}</div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Due Date</p>
                  <p>{new Date(student.fees.nextDue).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.fees.history.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">₹{transaction.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
        <Card>
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
        </Card>

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will deactivate the student <strong>{student.name}</strong>. 
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document for {student.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-upload">Select Document</Label>
                <Input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleUploadDocument}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDocumentDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetailPage;
