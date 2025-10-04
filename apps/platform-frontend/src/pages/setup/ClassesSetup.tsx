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
      
      toast({
        variant: "destructive",
        title: "Error Creating Classes",
        description: error.message || 'Failed to create classes. Please try again.',
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
      <div className="min-h-screen overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 shadow-large">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 backdrop-blur-sm rounded-2xl">
                  <GraduationCap className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">School ID Required</h2>
                  <p className="text-muted-foreground mb-6">School ID is required to setup classes.</p>
                </div>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="h-12 px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative container mx-auto px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-2xl">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Setup Classes
                </h1>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-large">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold">School Classes Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
                  {/* Classes Selection */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Select Classes</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="selectedClasses"
                      render={() => (
                        <FormItem>
                          <div className="space-y-8">
                            {Object.entries(classesByCategory).map(([category, classes]) => {
                              const categoryClasses = classes.map(cls => cls.name);
                              const selectedFromCategory = selectedClasses.filter(cls => categoryClasses.includes(cls));
                              const allSelected = categoryClasses.length === selectedFromCategory.length;
                              const someSelected = selectedFromCategory.length > 0;

                              return (
                                <div key={category} className="border border-border/50 rounded-xl p-6 bg-card/30 backdrop-blur-sm">
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-bold text-xl text-foreground">{category}</h4>
                                    <Button
                                      type="button"
                                      variant={allSelected ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleSelectAll(category)}
                                      className="h-10 px-4"
                                    >
                                      {allSelected ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Deselect All
                                        </>
                                      ) : (
                                        <>Select All {someSelected && `(${selectedFromCategory.length}/${categoryClasses.length})`}</>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {classes.map((cls) => (
                                      <div key={cls.name} className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-background/80 transition-colors">
                                        <Checkbox
                                          id={cls.name}
                                          checked={selectedClasses.includes(cls.name)}
                                          onCheckedChange={(checked) => handleClassToggle(cls.name, checked as boolean)}
                                          className="h-5 w-5"
                                        />
                                        <label
                                          htmlFor={cls.name}
                                          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
                      <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl backdrop-blur-sm">
                        <h4 className="font-bold text-lg text-foreground mb-4">Selected Classes ({selectedClasses.length})</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedClasses.map((className) => (
                            <span
                              key={className}
                              className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                            >
                              {className}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      disabled={isLoading}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || selectedClasses.length === 0}
                      className="flex-1 px-12 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-w-[250px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Classes...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="mr-2 h-5 w-5" />
                          Create Classes ({selectedClasses.length})
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassesSetup;