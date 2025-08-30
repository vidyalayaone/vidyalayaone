import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save,
  DollarSign,
  CalendarIcon,
  Receipt,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Fee submission schema
const feeSubmissionSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required'),
  payments: z.array(z.object({
    feeType: z.enum(['TUITION', 'TRANSPORT', 'LIBRARY', 'LAB', 'SPORTS', 'EXAM', 'MISC']),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIALLY_PAID']),
    paymentDetails: z.object({
      referenceNumber: z.string().optional(),
      paymentDate: z.string().optional(),
      paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE']).optional(),
      notes: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one payment entry is required')
});

type FeeSubmissionForm = z.infer<typeof feeSubmissionSchema>;

interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
}

interface FeeSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeeSubmissionForm) => Promise<void>;
  initialData?: Partial<FeeSubmissionForm>;
}

// Mock student data for search
const mockStudents: Student[] = [
  { id: 'STU001', name: 'Rahul Sharma', class: '10', section: 'A', rollNumber: '001' },
  { id: 'STU002', name: 'Priya Patel', class: '12', section: 'B', rollNumber: '002' },
  { id: 'STU003', name: 'Arjun Singh', class: '11', section: 'A', rollNumber: '003' },
  { id: 'STU004', name: 'Sneha Reddy', class: '10', section: 'C', rollNumber: '004' },
  { id: 'STU005', name: 'Aditya Kumar', class: '12', section: 'A', rollNumber: '005' },
];

const feeTypes = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'TRANSPORT', label: 'Transport Fee' },
  { value: 'LIBRARY', label: 'Library Fee' },
  { value: 'LAB', label: 'Laboratory Fee' },
  { value: 'SPORTS', label: 'Sports Fee' },
  { value: 'EXAM', label: 'Examination Fee' },
  { value: 'MISC', label: 'Miscellaneous' },
];

const paymentModes = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Credit/Debit Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'ONLINE', label: 'Online Payment' },
];

export const FeeSubmissionForm: React.FC<FeeSubmissionFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeeSubmissionForm>({
    // resolver: zodResolver(feeSubmissionSchema),
    defaultValues: {
      studentId: '',
      payments: [
        {
          feeType: 'TUITION',
          amount: 0,
          paymentStatus: 'PENDING',
          paymentDetails: {
            referenceNumber: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMode: 'CASH',
            notes: '',
          },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payments',
  });

  // Filter students based on search
  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    form.setValue('studentId', student.id);
    setSearchTerm('');
  };

  const handleSubmit = async (data: FeeSubmissionForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Fee submission updated successfully');
      onOpenChange(false);
      form.reset();
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Failed to submit fee information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPaymentEntry = () => {
    append({
      feeType: 'TUITION',
      amount: 0,
      paymentStatus: 'PENDING',
      paymentDetails: {
        referenceNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'CASH',
        notes: '',
      },
    });
  };

  const calculateTotal = () => {
    return form.watch('payments').reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Update Student Fee Status
          </DialogTitle>
          <DialogDescription>
            Update fee information and payment details for students
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedStudent ? (
                  <div className="space-y-2">
                    <Label>Search Student</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, ID, or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {searchTerm && (
                      <div className="border rounded-lg max-h-40 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {filteredStudents.map((student) => (
                              <div
                                key={student.id}
                                className="p-2 hover:bg-muted rounded cursor-pointer"
                                onClick={() => handleStudentSelect(student)}
                              >
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {student.id} • Class {student.class}-{student.section} • Roll: {student.rollNumber}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No students found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">{selectedStudent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedStudent.id} • Class {selectedStudent.class}-{selectedStudent.section}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(null);
                        form.setValue('studentId', '');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Entries */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Fee Payments</CardTitle>
                    <CardDescription>Add and manage fee payment entries</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={addPaymentEntry}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Payment Entry {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`payments.${index}.feeType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fee Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fee type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {feeTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`payments.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`payments.${index}.paymentStatus`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Payment Details Section */}
                    {form.watch(`payments.${index}.paymentStatus`) === 'PAID' && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                        <h5 className="font-medium flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Payment Details
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`payments.${index}.paymentDetails.referenceNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reference Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="REF123456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`payments.${index}.paymentDetails.paymentDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`payments.${index}.paymentDetails.paymentMode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentModes.map((mode) => (
                                      <SelectItem key={mode.value} value={mode.value}>
                                        <div className="flex items-center gap-2">
                                          <CreditCard className="h-4 w-4" />
                                          {mode.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`payments.${index}.paymentDetails.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Additional notes about the payment..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Total Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedStudent}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Fee Information'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
