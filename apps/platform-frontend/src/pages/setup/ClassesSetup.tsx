import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { schoolAPI } from '@/lib/api';
import { useSchoolStore } from '@/store/schoolStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, ArrowLeft, CheckCircle } from 'lucide-react';

// Validation schema for classes setup
const classesSetupSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)'),
  selectedClasses: z.array(z.string()).min(1, 'Please select at least one class'),
});

type ClassesSetupForm = z.infer<typeof classesSetupSchema>;

// Common Indian school classes
const INDIAN_SCHOOL_CLASSES = [
  // Primary Classes
  { name: 'Nursery', category: 'Primary' },
  { name: 'LKG', category: 'Primary' },
  { name: 'UKG', category: 'Primary' },
  { name: 'Class 1', category: 'Primary' },
  { name: 'Class 2', category: 'Primary' },
  { name: 'Class 3', category: 'Primary' },
  { name: 'Class 4', category: 'Primary' },
  { name: 'Class 5', category: 'Primary' },
  
  // Secondary Classes
  { name: 'Class 6', category: 'Secondary' },
  { name: 'Class 7', category: 'Secondary' },
  { name: 'Class 8', category: 'Secondary' },
  { name: 'Class 9', category: 'Secondary' },
  { name: 'Class 10', category: 'Secondary' },
  
  // Higher Secondary Classes
  { name: 'Class 11', category: 'Higher Secondary' },
  { name: 'Class 12', category: 'Higher Secondary' },
];

const ClassesSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolIdFromUrl = searchParams.get('schoolId');
  const { school, updateSetupProgress } = useSchoolStore();
  
  // Use schoolId from URL params or from store
  const schoolId = schoolIdFromUrl || school?.id;

  const form = useForm<ClassesSetupForm>({
    resolver: zodResolver(classesSetupSchema as any),
    defaultValues: {
      schoolId: schoolId || '',
      academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
      selectedClasses: [],
    },
  });

  const handleSubmit = async (data: ClassesSetupForm) => {
    setIsLoading(true);
    try {
      await schoolAPI.addClasses({
        schoolId: data.schoolId,
        classes: data.selectedClasses,
        academicYear: "2025-26",
      });

      // Update setup progress
      updateSetupProgress({ classesAdded: true });

      toast({
        title: "Classes Created Successfully!",
        description: `${data.selectedClasses.length} classes have been created for your school.`,
      });

      // Navigate to next step or dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating classes:', error);
      
      const errorMessage = error.response?.data?.error?.message || 'Failed to create classes. Please try again.';
      toast({
        variant: "destructive",
        title: "Error Creating Classes",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassToggle = (className: string, checked: boolean) => {
    const currentClasses = form.getValues('selectedClasses');
    if (checked) {
      form.setValue('selectedClasses', [...currentClasses, className]);
    } else {
      form.setValue('selectedClasses', currentClasses.filter(c => c !== className));
    }
  };

  const handleSelectAll = (category: string) => {
    const categoryClasses = INDIAN_SCHOOL_CLASSES
      .filter(cls => cls.category === category)
      .map(cls => cls.name);
    
    const currentClasses = form.getValues('selectedClasses');
    const allCategorySelected = categoryClasses.every(cls => currentClasses.includes(cls));
    
    if (allCategorySelected) {
      // Deselect all from this category
      form.setValue('selectedClasses', currentClasses.filter(cls => !categoryClasses.includes(cls)));
    } else {
      // Select all from this category
      const newClasses = [...new Set([...currentClasses, ...categoryClasses])];
      form.setValue('selectedClasses', newClasses);
    }
  };

  const selectedClasses = form.watch('selectedClasses');

  // Group classes by category
  const classesByCategory = INDIAN_SCHOOL_CLASSES.reduce((acc, cls) => {
    if (!acc[cls.category]) acc[cls.category] = [];
    acc[cls.category].push(cls);
    return acc;
  }, {} as Record<string, typeof INDIAN_SCHOOL_CLASSES>);

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">School ID is required to setup classes.</p>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Classes</h1>
          <p className="text-gray-600">Select the classes that your school offers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Classes Configuration</CardTitle>
            <CardDescription>
              Choose the classes that your school will offer for the academic year.
              You can select multiple classes across different levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                <FormField
                  control={form.control}
                  name="selectedClasses"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Classes</FormLabel>
                      <div className="space-y-6">
                        {Object.entries(classesByCategory).map(([category, classes]) => {
                          const categoryClasses = classes.map(cls => cls.name);
                          const selectedFromCategory = selectedClasses.filter(cls => categoryClasses.includes(cls));
                          const allSelected = categoryClasses.length === selectedFromCategory.length;
                          const someSelected = selectedFromCategory.length > 0;

                          return (
                            <div key={category} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-lg">{category}</h3>
                                <Button
                                  type="button"
                                  variant={allSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSelectAll(category)}
                                >
                                  {allSelected ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Deselect All
                                    </>
                                  ) : (
                                    <>Select All {someSelected && `(${selectedFromCategory.length}/${categoryClasses.length})`}</>
                                  )}
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {classes.map((cls) => (
                                  <div key={cls.name} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={cls.name}
                                      checked={selectedClasses.includes(cls.name)}
                                      onCheckedChange={(checked) => handleClassToggle(cls.name, checked as boolean)}
                                    />
                                    <label
                                      htmlFor={cls.name}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {cls.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClasses.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Classes ({selectedClasses.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedClasses.map((className) => (
                        <span
                          key={className}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {className}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || selectedClasses.length === 0}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Classes ({selectedClasses.length})
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassesSetup;
