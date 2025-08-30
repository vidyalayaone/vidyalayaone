import React, { useState } from 'react';
import { 
  Eye, 
  Download, 
  FileText, 
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';

interface FeeTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  mode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';
  referenceNumber?: string;
  receiptNumber?: string;
  notes?: string;
}

interface FeeStructureTableProps {
  studentId: string;
  studentName: string;
  className?: string;
}

// Mock fee transaction data
const mockFeeTransactions: FeeTransaction[] = [
  {
    id: 'TXN001',
    date: '2024-08-15',
    description: 'Tuition Fee - Q2 2024',
    amount: 15000,
    status: 'COMPLETED',
    mode: 'UPI',
    referenceNumber: 'UPI2024081512345',
    receiptNumber: 'REC-2024-001',
    notes: 'Quarterly tuition payment'
  },
  {
    id: 'TXN002',
    date: '2024-07-20',
    description: 'Transport Fee - July 2024',
    amount: 3000,
    status: 'COMPLETED',
    mode: 'CASH',
    receiptNumber: 'REC-2024-002',
  },
  {
    id: 'TXN003',
    date: '2024-06-10',
    description: 'Library Fee - Annual',
    amount: 1500,
    status: 'COMPLETED',
    mode: 'BANK_TRANSFER',
    referenceNumber: 'BANK202406101234',
    receiptNumber: 'REC-2024-003',
  },
  {
    id: 'TXN004',
    date: '2024-05-25',
    description: 'Sports Fee - Annual',
    amount: 2500,
    status: 'COMPLETED',
    mode: 'CARD',
    referenceNumber: 'CARD****1234',
    receiptNumber: 'REC-2024-004',
  },
  {
    id: 'TXN005',
    date: '2024-04-15',
    description: 'Tuition Fee - Q1 2024',
    amount: 15000,
    status: 'COMPLETED',
    mode: 'CHEQUE',
    referenceNumber: 'CHQ-789456',
    receiptNumber: 'REC-2024-005',
    notes: 'Cheque cleared on 2024-04-18'
  },
  {
    id: 'TXN006',
    date: '2024-08-30',
    description: 'Laboratory Fee - Semester 1',
    amount: 4000,
    status: 'PENDING',
    mode: 'ONLINE',
  },
];

export const FeeStructureTable: React.FC<FeeStructureTableProps> = ({
  studentId,
  studentName,
  className = ""
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-50 text-green-800 border-green-300',
      PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-300',
      FAILED: 'bg-red-50 text-red-800 border-red-300'
    };

    const icons = {
      COMPLETED: CheckCircle,
      PENDING: Clock,
      FAILED: AlertCircle
    };

    const Icon = icons[status as keyof typeof icons] || Clock;
    const styleClass = styles[status as keyof typeof styles] || styles.PENDING;

    return (
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${styleClass}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const getPaymentModeIcon = (mode: string) => {
    const icons = {
      CASH: '💵',
      CARD: '💳',
      UPI: '📱',
      BANK_TRANSFER: '🏦',
      ONLINE: '🌐',
      CHEQUE: '📝'
    };
    return icons[mode as keyof typeof icons] || '💰';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalPaid = mockFeeTransactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = mockFeeTransactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleViewReceipt = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
  };

  const handleDownloadReceipt = (transaction: FeeTransaction) => {
    // Mock PDF download
    const link = document.createElement('a');
    link.href = `/api/receipts/${transaction.receiptNumber}.pdf`;
    link.download = `Receipt_${transaction.receiptNumber}.pdf`;
    link.click();
    
    // Show success message
    console.log(`Downloading receipt for ${transaction.receiptNumber}`);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fee Payment History
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all fee payments for {studentName}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Student ID</div>
              <div className="font-medium">{studentId}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Paid</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(totalPaid)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {formatCurrency(totalPending)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                    <div className="text-lg font-semibold">
                      {mockFeeTransactions.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFeeTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No fee transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  mockFeeTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.notes && (
                            <div className="text-sm text-muted-foreground">{transaction.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPaymentModeIcon(transaction.mode)}</span>
                          <span className="capitalize">{transaction.mode.replace('_', ' ').toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.referenceNumber && (
                            <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {transaction.referenceNumber}
                            </div>
                          )}
                          {transaction.receiptNumber && (
                            <div className="text-xs text-muted-foreground">
                              Receipt: {transaction.receiptNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {transaction.status === 'COMPLETED' && transaction.receiptNumber && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReceipt(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(transaction)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Preview Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Receipt
            </DialogTitle>
            <DialogDescription>
              Receipt details for transaction {selectedTransaction?.receiptNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">Vidyalaya School</h2>
                <p className="text-sm text-muted-foreground">Fee Payment Receipt</p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedTransaction.receiptNumber}
                  </Badge>
                </div>
              </div>

              {/* Student & Payment Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">STUDENT DETAILS</h3>
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {studentName}</div>
                    <div><strong>Student ID:</strong> {studentId}</div>
                    <div><strong>Date:</strong> {formatDate(selectedTransaction.date)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">PAYMENT DETAILS</h3>
                  <div className="space-y-1">
                    <div><strong>Method:</strong> {selectedTransaction.mode.replace('_', ' ')}</div>
                    {selectedTransaction.referenceNumber && (
                      <div><strong>Reference:</strong> {selectedTransaction.referenceNumber}</div>
                    )}
                    <div><strong>Status:</strong> {selectedTransaction.status}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fee Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold">FEE BREAKDOWN</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedTransaction.description}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(selectedTransaction.amount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount Paid</span>
                <span className="text-green-600">{formatCurrency(selectedTransaction.amount)}</span>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  This is a computer-generated receipt and does not require a signature.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Receipt generated on {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>

              {/* Download Action */}
              <div className="flex justify-center">
                <Button onClick={() => handleDownloadReceipt(selectedTransaction)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
