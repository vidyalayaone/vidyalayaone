// Admission Applications List Page - Review and manage student applications

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { api } from '@/api/api';
import { ProfileServiceStudent, StudentApplicationsResponse } from '@/api/types';
import toast from 'react-hot-toast';

const AdmissionApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applicationsData, setApplicationsData] = useState<StudentApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Load applications
  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.getStudentApplications();
      if (response.success) {
        setApplicationsData(response.data);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications based on active tab and search term
  const filteredApplications = useMemo(() => {
    if (!applicationsData) return [];
    
    let applications: ProfileServiceStudent[] = [];
    
    switch (activeTab) {
      case 'pending':
        applications = applicationsData.pendingStudents;
        break;
      case 'accepted':
        applications = applicationsData.acceptedStudents;
        break;
      case 'rejected':
        applications = applicationsData.rejectedStudents;
        break;
      default:
        applications = [];
    }

    if (searchTerm) {
      return applications.filter(app => 
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return applications;
  }, [applicationsData, activeTab, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-800 bg-orange-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge variant="outline" className="border-green-300 text-green-800 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
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

  // Remove unused functions since the new data structure doesn't have priority/source
  // const getPriorityBadge = ... (removed)
  // const getSourceBadge = ... (removed)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewApplication = (id: string) => {
    navigate(`/admission/applications/${id}`);
  };

  // Count applications by status from the summary
  const statusCounts = useMemo(() => {
    if (!applicationsData) return { pending: 0, accepted: 0, rejected: 0 };
    
    return {
      pending: applicationsData.summary.totalPending,
      accepted: applicationsData.summary.totalAccepted,
      rejected: applicationsData.summary.totalRejected,
    };
  }, [applicationsData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admission')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admission</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Admission Applications</h1>
          </div>
        </div>

        {/* Applications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Accepted ({statusCounts.accepted})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Applications List ({filteredApplications.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on any application to view details and take actions
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Guardian</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Application Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading applications...
                          </TableCell>
                        </TableRow>
                      ) : filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">No applications found.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((application) => (
                          <TableRow 
                            key={application.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleViewApplication(application.id)}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={application.profilePhoto || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {application.firstName[0]}{application.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {application.firstName} {application.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {application.gender} • {application.category}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {application.guardians?.length > 0 ? (
                                  <>
                                    <div className="font-medium">{application.guardians[0].guardian.firstName} {application.guardians[0].guardian.lastName}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {application.guardians[0].guardian.phone || 'N/A'}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-muted-foreground">No guardian info</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {application.dateOfBirth ? formatDateOnly(application.dateOfBirth) : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(application.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(application.status || 'PENDING')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdmissionApplicationsPage;
