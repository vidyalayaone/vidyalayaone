// Fee Structure Creation Form Component

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Save,
  DollarSign,
  GraduationCap,
  CalendarIcon,
  BookOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';

// Fee structure schema
const feeStructureSchema = z.object({
  structureName: z.string().min(1, 'Structure name is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  applicableGrades: z.array(z.string()).min(1, 'At least one grade must be selected'),
  feeCategories: z.array(z.object({
    categoryName: z.string().min(1, 'Category name is required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    isOptional: z.boolean(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
  })).min(1, 'At least one fee category is required'),
  paymentSchedule: z.enum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL']),
  notes: z.string().optional(),
});

type FeeStructureForm = z.infer<typeof feeStructureSchema>;

interface FeeStructureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeeStructureForm) => Promise<void>;
  initialData?: Partial<FeeStructureForm>;
}

const FEE_CATEGORIES = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'TRANSPORT', label: 'Transport Fee' },
  { value: 'LIBRARY', label: 'Library Fee' },
  { value: 'LAB', label: 'Laboratory Fee' },
  { value: 'SPORTS', label: 'Sports Fee' },
  { value: 'EXAM', label: 'Examination Fee' },
  { value: 'DEVELOPMENT', label: 'Development Fee' },
  { value: 'MISC', label: 'Miscellaneous' },
];

const GRADES = ['9', '10', '11', '12'];
const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27'];

export const FeeStructureForm: React.FC<FeeStructureFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeeStructureForm>({
    defaultValues: {
      structureName: '',
      academicYear: '2024-25',
      applicableGrades: [],
      feeCategories: [
        {
          categoryName: 'TUITION',
          amount: 0,
          isOptional: false,
          description: '',
          dueDate: '',
        },
      ],
      paymentSchedule: 'QUARTERLY',
      notes: '',
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'feeCategories',
  });

  const handleSubmit = async (data: FeeStructureForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
      toast.success('Fee structure created successfully!');
    } catch (error) {
      toast.error('Failed to create fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeeCategory = () => {
    append({
      categoryName: 'TUITION',
      amount: 0,
      isOptional: false,
      description: '',
      dueDate: '',
    });
  };

  const totalAmount = form.watch('feeCategories').reduce((sum, category) => sum + (category.amount || 0), 0);

  const toggleGrade = (grade: string) => {
    const currentGrades = form.getValues('applicableGrades');
    if (currentGrades.includes(grade)) {
      form.setValue('applicableGrades', currentGrades.filter(g => g !== grade));
    } else {
      form.setValue('applicableGrades', [...currentGrades, grade]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Create Fee Structure
          </DialogTitle>
          <DialogDescription>
            Set up a new fee structure for the academic year
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="structureName">Structure Name *</Label>
                  <Input
                    id="structureName"
                    placeholder="e.g., Standard Fee Structure 2024-25"
                    {...form.register('structureName')}
                  />
                  {form.formState.errors.structureName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.structureName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Select 
                    value={form.watch('academicYear')} 
                    onValueChange={(value) => form.setValue('academicYear', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applicable Grades *</Label>
                <div className="flex gap-2">
                  {GRADES.map((grade) => (
                    <Button
                      key={grade}
                      type="button"
                      variant={form.watch('applicableGrades').includes(grade) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleGrade(grade)}
                    >
                      Grade {grade}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.applicableGrades && (
                  <p className="text-sm text-red-500">
                    At least one grade must be selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                <Select 
                  value={form.watch('paymentSchedule')} 
                  onValueChange={(value) => form.setValue('paymentSchedule', value as 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="SEMESTER">Semester</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fee Categories */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Fee Categories</CardTitle>
                  <CardDescription>Define the fee categories and amounts</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addFeeCategory}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Category {index + 1}</h4>
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
                    <div className="space-y-2">
                      <Label>Category Type *</Label>
                      <Select 
                        value={form.watch(`feeCategories.${index}.categoryName`)}
                        onValueChange={(value) => form.setValue(`feeCategories.${index}.categoryName`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {FEE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...form.register(`feeCategories.${index}.amount`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        {...form.register(`feeCategories.${index}.dueDate`)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Optional description for this fee category"
                      {...form.register(`feeCategories.${index}.description`)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.watch(`feeCategories.${index}.isOptional`)}
                      onCheckedChange={(checked) => form.setValue(`feeCategories.${index}.isOptional`, checked)}
                    />
                    <Label className="text-sm">This fee is optional</Label>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Fee Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this fee structure..."
                  {...form.register('notes')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Structure'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeeStructureForm;
