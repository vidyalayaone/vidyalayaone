// Main Fees Management Page

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Send, 
  RefreshCw,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  PieChart,
  BarChart3,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { feesAPI, StudentFeeSummary, FeesStats, FeeAuditLog } from '@/api/mockFeesAPI';

const FeesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<StudentFeeSummary[]>([]);
  const [stats, setStats] = useState<FeesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<FeeAuditLog[]>([]);
  const [exporting, setExporting] = useState(false);

  // Filters from URL params
  const searchTerm = searchParams.get('search') || '';
  const classFilter = searchParams.get('class') || 'all';
  const sectionFilter = searchParams.get('section') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const yearFilter = searchParams.get('year') || '2024-25';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, statsData] = await Promise.all([
        feesAPI.getFeeSummaries({
          search: searchTerm,
          class: classFilter,
          section: sectionFilter,
          feeStatus: statusFilter,
          academicYear: yearFilter
        }),
        feesAPI.getFeesStats()
      ]);
      setStudents(studentsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, classFilter, sectionFilter, statusFilter, yearFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.studentId));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleBulkReminder = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to send reminders');
      return;
    }

    try {
      const result = await feesAPI.sendBulkReminder(selectedStudents);
      if (result.success) {
        toast.success(result.message);
        setSelectedStudents([]);
        setReminderModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const result = await feesAPI.exportFeesData(format);
      if (result.success) {
        toast.success(`${format.toUpperCase()} report generated successfully`);
        // In a real app, this would trigger a download
        console.log('Download URL:', result.downloadUrl);
      }
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const trail = await feesAPI.getGlobalAuditTrail();
      setAuditTrail(trail);
      setAuditModalOpen(true);
    } catch (error) {
      toast.error('Failed to load audit trail');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-50 text-green-800 border-green-300',
      PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-300',
      PARTIALLY_PAID: 'bg-blue-50 text-blue-800 border-blue-300',
      OVERDUE: 'bg-red-50 text-red-800 border-red-300'
    };

    const icons = {
      PAID: CheckCircle,
      PENDING: Clock,
      PARTIALLY_PAID: AlertCircle,
      OVERDUE: AlertCircle
    };

    const Icon = icons[status as keyof typeof icons] || Clock;
    const className = styles[status as keyof typeof styles] || styles.PENDING;

    return (
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const chartData = useMemo(() => {
    if (!stats) return { pieData: [], barData: [] };

    const pieData = [
      { name: 'Paid', value: stats.paidStudents, color: '#10b981' },
      { name: 'Pending', value: stats.pendingStudents, color: '#f59e0b' },
      { name: 'Partially Paid', value: stats.partiallyPaidStudents, color: '#3b82f6' },
      { name: 'Overdue', value: stats.overdueStudents, color: '#ef4444' }
    ];

    const barData = Object.entries(stats.collectionByClass).map(([grade, amount]) => ({
      grade: `Grade ${grade}`,
      amount
    }));

    return { pieData, barData };
  }, [stats]);

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading fees data...</p>
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
          <div>
            <h1 className="text-3xl font-bold">Fees Management</h1>
            <p className="text-muted-foreground">Manage student fees and payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAuditTrail}>
              <History className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.paidStudents} students paid fully
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingFees)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingStudents + stats.partiallyPaidStudents + stats.overdueStudents} students with dues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.totalCollected / stats.totalFeeAmount) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Of total fees</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Student List</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={classFilter} onValueChange={(value) => updateFilter('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sectionFilter} onValueChange={(value) => updateFilter('section', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fee Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={yearFilter} onValueChange={(value) => updateFilter('year', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={loadData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedStudents.length} student(s) selected
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setReminderModalOpen(true)}
                      className="border-blue-300 text-blue-800 hover:bg-blue-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>Students ({students.length})</CardTitle>
                <CardDescription>
                  View and manage student fee information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedStudents.length === students.length && students.length > 0}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Class/Section</TableHead>
                        <TableHead>Fee Status</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Balance Due</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading students...
                          </TableCell>
                        </TableRow>
                      ) : students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">No students found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        students.map((student) => (
                          <TableRow key={student.studentId} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.studentId)}
                                onCheckedChange={(checked) => handleSelectStudent(student.studentId, !!checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-muted-foreground">{student.studentId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">Grade {student.class}</div>
                              <div className="text-sm text-muted-foreground">Section {student.section}</div>
                            </TableCell>
                            <TableCell>{getStatusBadge(student.feeStatus)}</TableCell>
                            <TableCell>{formatDate(student.lastPaymentDate)}</TableCell>
                            <TableCell>
                              <div className="font-medium text-red-600">{formatCurrency(student.balanceDue)}</div>
                              <div className="text-sm text-muted-foreground">
                                of {formatCurrency(student.totalFee)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/students/${student.studentId}/fees`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
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

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fee Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Fee Status Distribution
                  </CardTitle>
                  <CardDescription>Student count by payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Collection by Class */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Collection by Class
                  </CardTitle>
                  <CardDescription>Fee collection amount by grade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.barData.map((item) => (
                      <div key={item.grade} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.grade}</span>
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${stats ? (item.amount / Math.max(...chartData.barData.map(d => d.amount))) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bulk Reminder Modal */}
        <Dialog open={reminderModalOpen} onOpenChange={setReminderModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Fee Reminders</DialogTitle>
              <DialogDescription>
                Send fee payment reminders to {selectedStudents.length} selected student(s).
                This will notify students and their parents about pending dues.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkReminder}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audit Trail Modal */}
        <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Global Fee Audit Trail</DialogTitle>
              <DialogDescription>
                System-wide fee management activities and updates
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {auditTrail.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{log.action.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          by {log.performedBy} • {new Date(log.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FeesPage;
