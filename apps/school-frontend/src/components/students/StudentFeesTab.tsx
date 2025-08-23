// Student Fees Detail Tab Component

import React, { useState, useEffect } from 'react';
import { 
  CreditCard,
  Download,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Receipt,
  DollarSign,
  Calendar,
  TrendingUp,
  History,
  Gift,
  ExternalLink,
  BarChart3,
  LineChart,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { feesAPI, StudentFeeDetail, FeeTransaction, FeeInstallment, FeeConcession, FeeAuditLog } from '@/api/mockFeesAPI';

interface StudentFeesTabProps {
  studentId: string;
}

const StudentFeesTab: React.FC<StudentFeesTabProps> = ({ studentId }) => {
  const [feeDetail, setFeeDetail] = useState<StudentFeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<FeeAuditLog[]>([]);
  const [receiptsModalOpen, setReceiptsModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const loadFeeDetail = async () => {
    setLoading(true);
    try {
      const detail = await feesAPI.getStudentFeeDetail(studentId);
      setFeeDetail(detail);
    } catch (error) {
      toast.error('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeDetail();
  }, [studentId]);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
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

  const getInstallmentStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      DUE: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800'
    };

    const className = styles[status as keyof typeof styles] || styles.DUE;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <DollarSign className="w-4 h-4" />;
      case 'CARD':
      case 'UPI':
      case 'ONLINE':
        return <CreditCard className="w-4 h-4" />;
      case 'BANK_TRANSFER':
      case 'CHEQUE':
        return <FileText className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleViewReceipt = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
  };

  const loadAuditTrail = async () => {
    try {
      const trail = await feesAPI.getStudentAuditTrail(studentId);
      setAuditTrail(trail);
      setAuditModalOpen(true);
    } catch (error) {
      toast.error('Failed to load audit trail');
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const result = await feesAPI.sendStudentReminder(studentId);
      if (result.success) {
        toast.success('Fee reminder sent successfully');
      }
    } catch (error) {
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const viewAllReceipts = () => {
    setReceiptsModalOpen(true);
  };

  const viewPaymentChart = () => {
    setChartModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fee details...</p>
        </div>
      </div>
    );
  }

  if (!feeDetail) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Fee details not available</p>
      </div>
    );
  }

  const paymentProgress = feeDetail?.paidAmount !== undefined && feeDetail?.totalFee 
    ? ((feeDetail.paidAmount / feeDetail.totalFee) * 100) 
    : 0;
  const hasOverdueInstallments = feeDetail?.installments?.some(inst => inst.status === 'OVERDUE') || false;

  return (
    <div className="space-y-6">
      {/* Fee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment Progress
            </CardTitle>
            <CardDescription>Overall fee payment status for Academic Year {feeDetail.academicYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Paid: {formatCurrency(feeDetail.paidAmount)}</span>
                <span>Balance: {formatCurrency(feeDetail.balanceDue)}</span>
              </div>
              <Progress value={paymentProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(paymentProgress)}% Complete</span>
                <span>Total: {formatCurrency(feeDetail.totalFee)}</span>
              </div>
            </div>
            <div className="pt-2">
              {getStatusBadge(feeDetail.feeStatus)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start" 
              onClick={handleSendReminder}
              disabled={sendingReminder}
            >
              <Bell className="w-4 h-4 mr-2" />
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={loadAuditTrail}>
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={viewAllReceipts}>
              <Receipt className="w-4 h-4 mr-2" />
              View Receipts
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={viewPaymentChart}>
              <LineChart className="w-4 h-4 mr-2" />
              Payment Chart
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList>
          <TabsTrigger value="ledger">Fee Ledger</TabsTrigger>
          <TabsTrigger value="installments">Installments</TabsTrigger>
          <TabsTrigger value="concessions">Concessions</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-6">
          {/* Alerts */}
          {hasOverdueInstallments && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Overdue Payments</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This student has overdue installments. Please follow up for payment.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Fee Ledger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fee Ledger</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={viewAllReceipts}>
                    <Receipt className="w-4 h-4 mr-2" />
                    All Receipts
                  </Button>
                  <Button variant="outline" size="sm" onClick={viewPaymentChart}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Payment Chart
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Chronological fee transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!feeDetail.transactions || feeDetail.transactions.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No transactions found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      feeDetail.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              {transaction.reference && (
                                <div className="text-sm text-muted-foreground">Ref: {transaction.reference}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.mode)}
                              <span className="text-sm">{transaction.mode.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.proofUrl ? (
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-800">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="text-xs font-mono">{transaction.receiptNumber}</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">No proof</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewReceipt(transaction)}
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

        <TabsContent value="installments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Installment-wise fee breakdown with color-coded statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeDetail.installments?.map((installment) => {
                      const progressValue = installment?.status === 'PAID' ? 100 : 
                                          installment?.status === 'OVERDUE' ? 0 : 50;
                      
                      return (
                        <TableRow key={installment?.id || Math.random()}>
                          <TableCell className="font-medium">{installment?.name || 'N/A'}</TableCell>
                          <TableCell>{installment?.dueDate ? formatDate(installment.dueDate) : 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(installment?.amount)}</TableCell>
                          <TableCell>
                            {installment?.paidDate ? formatDate(installment.paidDate) : '-'}
                          </TableCell>
                          <TableCell>{getInstallmentStatusBadge(installment?.status || 'PENDING')}</TableCell>
                          <TableCell className="w-32">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    installment?.status === 'PAID' ? 'bg-green-500' :
                                    installment?.status === 'OVERDUE' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${progressValue}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{progressValue}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Fee Concessions
              </CardTitle>
              <CardDescription>Applied discounts and scholarships</CardDescription>
            </CardHeader>
            <CardContent>
              {(!feeDetail.concessions || feeDetail.concessions.length === 0) ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No concessions applied</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feeDetail.concessions?.map((concession) => (
                    <Card key={concession?.id || Math.random()} className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-green-800">{concession?.type || 'N/A'}</h4>
                            <p className="text-sm text-green-700">{concession?.description || 'No description'}</p>
                            <p className="text-xs text-green-600">
                              Applied on {concession?.appliedDate ? formatDate(concession.appliedDate) : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-800">
                              -{formatCurrency(concession?.amount)}
                            </div>
                            <div className="text-xs text-green-600">
                              {concession?.percentage || 0}% off
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Transaction details and receipt information
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">Vidyalaya One School</h3>
                <p className="text-sm text-muted-foreground">Fee Payment Receipt</p>
                <p className="text-sm font-mono">Receipt No: {selectedTransaction.receiptNumber}</p>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <p className="text-sm font-mono">{selectedTransaction.reference || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{selectedTransaction.description}</p>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-4 border-t">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Trail Modal */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fee History & Audit Trail</DialogTitle>
            <DialogDescription>
              All fee-related activities and updates for this student
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

      {/* All Receipts Modal */}
      <Dialog open={receiptsModalOpen} onOpenChange={setReceiptsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Payment Receipts</DialogTitle>
            <DialogDescription>
              View and download all payment receipts for this student
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {feeDetail?.transactions
                .filter(t => t.receiptNumber)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Receipt className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Receipt #{transaction.receiptNumber}</p>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} • {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReceipt(transaction)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              {(!feeDetail?.transactions.some(t => t.receiptNumber)) && (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No receipts available</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Chart Modal */}
      <Dialog open={chartModalOpen} onOpenChange={setChartModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Chart</DialogTitle>
            <DialogDescription>
              Visual representation of payment history across terms/months
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Chart placeholder - in a real app, you would use Chart.js or similar */}
            <div className="h-80 border rounded-lg p-6 bg-muted/20">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LineChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-muted-foreground">Payment Timeline Chart</p>
                  <p className="text-sm text-muted-foreground">
                    Interactive chart showing payment trends over time
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Chart would show: Monthly payments, term-wise collection, payment methods distribution
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{feeDetail?.transactions.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(feeDetail?.paidAmount || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(((feeDetail?.paidAmount || 0) / (feeDetail?.totalFee || 1)) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentFeesTab;
