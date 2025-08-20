// Edit existing student form

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Simplified edit schema: only basic information (extended with parent fields)
const editStudentSchema = z.object({
  rollNo: z.string().min(1, 'Roll number is required'),
  name: z.string().min(1, 'Student name is required'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  // Father details
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherEmail: z.string().optional(),
  fatherOccupation: z.string().optional(),
  // Mother details
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  motherEmail: z.string().optional(),
  motherOccupation: z.string().optional(),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

// Mock student data (matches StudentDetailPage mock shape)
const mockStudent = {
  id: 'STU123',
  rollNo: '23',
  name: 'John Doe',
  class: '6',
  section: 'A',
  admissionDate: '2022-04-10',
  email: 'john@example.com',
  phone: '+91-9876543210',
  address: '123 Main Street, City',
  status: 'Active',
  feeStatus: 'Pending',
  avatar: '/placeholder.svg',
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
  documents: [{ id: 1, name: 'Birth Certificate', url: '#' }],
  fees: {
    structure: 'Annual: 40,000 INR',
    nextDue: '2025-09-10',
    totalAmount: 40000,
    paidAmount: 30000,
    pendingAmount: 10000,
    history: [
      { date: '2025-04-10', amount: 10000, status: 'Paid', method: 'Online' }
    ]
  },
  activity: [
    { date: '2025-08-10', event: 'Fee paid' },
    { date: '2025-08-15', event: 'Document uploaded' }
  ]
};

const EditStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use mock data instead of real API
  const student = mockStudent;

  const form = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema as any),
    defaultValues: {
      rollNo: student.rollNo,
      name: student.name,
      class: student.class,
      section: student.section,
      admissionDate: student.admissionDate,
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      // father/mother defaults
      fatherName: student.parentGuardian?.fatherName || '',
      fatherPhone: student.parentGuardian?.fatherPhone || '',
      fatherEmail: student.parentGuardian?.fatherEmail || '',
      fatherOccupation: student.parentGuardian?.fatherOccupation || '',
      motherName: student.parentGuardian?.motherName || '',
      motherPhone: student.parentGuardian?.motherPhone || '',
      motherEmail: student.parentGuardian?.motherEmail || '',
      motherOccupation: student.parentGuardian?.motherOccupation || '',
    },
  });

  const onSubmit = async (data: EditStudentFormData) => {
    setIsSubmitting(true);
    try {
      // Build payload (mock)
      const payload = {
        id: student.id,
        ...data,
      };
      console.log('Submitting updated basic info:', payload);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate(`/students/${student.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/students/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
            <p className="text-muted-foreground">Update basic information for {student.name}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rollNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll No *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle>Parents / Guardians</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Father */}
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground">Father</p>
                    <div className="space-y-2 mt-2">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Mother */}
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground">Mother</p>
                    <div className="space-y-2 mt-2">
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherOccupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate(`/students/${student.id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditStudentPage;
