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
  RefreshCw
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

import { AdmissionApplication, applicationAPI } from '@/api/mockAdmissionApplicationAPI';

const AdmissionApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Load applications
  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await applicationAPI.getApplications({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        source: sourceFilter
      });
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [searchTerm, statusFilter, priorityFilter, sourceFilter]);

  // Filter applications based on active tab
  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter(app => app.status === activeTab.toUpperCase().replace('-', '_'));
  }, [applications, activeTab]);

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
            <AlertCircle className="w-3 h-3 mr-1" />
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ONLINE_PORTAL':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Online</Badge>;
      case 'WALK_IN':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">Walk-in</Badge>;
      case 'REFERRAL':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Referral</Badge>;
      default:
        return <Badge variant="secondary">{source}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewApplication = (id: string) => {
    navigate(`/admission/applications/${id}`);
  };

  // Count applications by status
  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      'under-review': applications.filter(app => app.status === 'UNDER_REVIEW').length,
      approved: applications.filter(app => app.status === 'APPROVED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
    };
  }, [applications]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admission Applications</h1>
            <p className="text-muted-foreground">
              Review and manage student admission applications
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={loadApplications} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by application number, student name, or parent email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ONLINE_PORTAL">Online</SelectItem>
                    <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Applications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="under-review" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Review ({statusCounts['under-review']})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({statusCounts.approved})
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
                        <TableHead>Application</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading applications...
                          </TableCell>
                        </TableRow>
                      ) : filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
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
                              <div>
                                <div className="font-medium">{application.applicationNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                  {application.documents.length} documents
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>
                                    {application.studentData.firstName[0]}{application.studentData.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {application.studentData.firstName} {application.studentData.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {application.studentData.dateOfBirth}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{application.submittedBy.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {application.submittedBy.email}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {application.submittedBy.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">Grade {application.studentData.grade}</div>
                                <div className="text-sm text-muted-foreground">
                                  Section {application.studentData.section}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(application.submittedAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(application.priority)}
                            </TableCell>
                            <TableCell>
                              {getSourceBadge(application.source)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(application.status)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewApplication(application.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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
