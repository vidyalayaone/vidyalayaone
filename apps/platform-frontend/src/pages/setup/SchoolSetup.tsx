import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { schoolAPI } from '@/lib/api';
import { useSchoolStore } from '@/store/schoolStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, ArrowLeft, Plus, X } from 'lucide-react';

// Address schema for structured address validation
const addressSchema = z.object({
  address1: z.string().min(1, 'Address line 1 is required').max(255, 'Address line 1 too long'),
  address2: z.string().max(255, 'Address line 2 too long').optional(),
  locality: z.string().min(1, 'Locality is required').max(100, 'Locality too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  state: z.string().min(1, 'State is required').max(100, 'State too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country too long'),
  pinCode: z.string().regex(/^\d{4,10}$/, 'Pin code must be 4-10 digits'),
  landmark: z.string().max(255, 'Landmark too long').optional(),
});

// School creation schema based on backend validation
const schoolSetupSchema = z.object({
  name: z.string()
    .min(2, 'School name must be at least 2 characters')
    .max(255, 'School name must not exceed 255 characters')
    .trim(),
  
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number')
    .refine(val => !val.includes('--'), 'Subdomain cannot contain consecutive hyphens'),
  
  address: addressSchema,
  
  level: z.enum(['primary', 'secondary', 'higher_secondary', 'mixed'], {
    required_error: 'Please select a school level',
  }),
  
  board: z.string()
    .max(255, 'Board name too long')
    .trim()
    .optional(),
  
  schoolCode: z.string()
    .min(2, 'School code must be at least 2 characters')
    .max(50, 'School code must not exceed 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'School code can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  
  phoneNumbers: z.array(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'))
    .min(1, 'At least one phone number is required')
    .max(5, 'Maximum 5 phone numbers allowed')
    .refine(arr => new Set(arr).size === arr.length, 'Phone numbers must be unique'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .trim()
    .optional(),
  
  principalName: z.string()
    .min(2, 'Principal name must be at least 2 characters')
    .max(255, 'Principal name too long')
    .regex(/^[a-zA-Z\s.]+$/, 'Principal name can only contain letters, spaces, and dots')
    .trim()
    .optional(),
  
  establishedYear: z.number()
    .int('Established year must be an integer')
    .min(1800, 'Established year cannot be before 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional()
    .nullable(),
  
  language: z.string()
    .min(2, 'Language must be at least 2 characters')
    .max(50, 'Language name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Language can only contain letters and spaces')
    .trim()
    .optional(),
});

type SchoolSetupForm = z.infer<typeof schoolSetupSchema>;

const SchoolSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setSchoolData } = useSchoolStore();

  const form = useForm<SchoolSetupForm>({
    resolver: zodResolver(schoolSetupSchema as any),
    defaultValues: {
      name: '',
      subdomain: '',
      address: {
        address1: '',
        address2: '',
        locality: '',
        city: '',
        state: '',
        country: 'India',
        pinCode: '',
        landmark: '',
      },
      level: undefined,
      board: '',
      schoolCode: '',
      phoneNumbers: [''],
      email: '',
      principalName: '',
      establishedYear: undefined,
      language: '',
    },
  });

  const phoneNumbers = form.watch('phoneNumbers');

  const addPhoneNumber = () => {
    if (phoneNumbers.length < 5) {
      form.setValue('phoneNumbers', [...phoneNumbers, '']);
    }
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      form.setValue('phoneNumbers', newPhoneNumbers);
    }
  };

  const generateSubdomain = (schoolName: string) => {
    return schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSchoolNameChange = (value: string) => {
    form.setValue('name', value);
    if (value && !form.getValues('subdomain')) {
      const subdomain = generateSubdomain(value);
      form.setValue('subdomain', subdomain);
    }
  };

  const onSubmit = async (data: SchoolSetupForm) => {
    setIsLoading(true);
    try {
      // Filter out empty phone numbers
      const filteredPhoneNumbers = data.phoneNumbers.filter(phone => phone.trim() !== '');
      
      // Prepare the data for the API
      const schoolData = {
        name: data.name,
        subdomain: data.subdomain,
        address: data.address,
        level: data.level,
        board: data.board || undefined,
        schoolCode: data.schoolCode || undefined,
        phoneNumbers: filteredPhoneNumbers,
        email: data.email || undefined,
        principalName: data.principalName || undefined,
        establishedYear: data.establishedYear || undefined,
        language: data.language || undefined,
      } as const;

      const response = await schoolAPI.create(schoolData as any);
      
      toast({
        title: 'School created successfully!',
        description: 'Your school profile has been created and is pending approval.',
      });

      // Update the school store with the new data
      setSchoolData({
        school: response.school,
        classes: [],
        totalSections: 0,
        totalSubjects: 0,
        setupProgress: {
          schoolCreated: true,
          classesAdded: false,
          sectionsAdded: false,
          subjectsAdded: false,
          paymentCompleted: false,
        }
      });
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Failed to create school',
        description: error.message || 'An error occurred while creating your school profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Your School Profile</h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                Fill in the details below to set up your school on VidyalayaOne platform
              </p>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-large">
            <CardHeader>
              <CardTitle className="text-2xl">School Information</CardTitle>
              <CardDescription>
                Provide accurate information about your school. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your school name" 
                                {...field}
                                onChange={(e) => handleSchoolNameChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdomain *</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input placeholder="your-school" {...field} />
                                <span className="ml-2 text-sm text-muted-foreground">.vidyalayaone.com</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              This will be your school's web address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select school level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="primary">Primary</SelectItem>
                                <SelectItem value="secondary">Secondary</SelectItem>
                                <SelectItem value="higher_secondary">Higher Secondary</SelectItem>
                                <SelectItem value="mixed">Mixed (Primary to Higher Secondary)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="board"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affiliated Board</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., CBSE, ICSE, State Board" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schoolCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., SCH-001" {...field} />
                            </FormControl>
                            <FormDescription>
                              Official school identification code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Language</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., English, Hindi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Address Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="address.address1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1 *</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address, building number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.address2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, floor (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.locality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Locality *</FormLabel>
                            <FormControl>
                              <Input placeholder="Area, neighborhood" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="City name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="State name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input placeholder="Country name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pin Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="Pin/Zip code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.landmark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landmark</FormLabel>
                            <FormControl>
                              <Input placeholder="Nearby landmark (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Phone Numbers *</FormLabel>
                        <FormDescription className="mb-3">
                          Add at least one phone number. You can add up to 5 phone numbers.
                        </FormDescription>
                        {phoneNumbers.map((_, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`phoneNumbers.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      placeholder="+91 9876543210" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {phoneNumbers.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePhoneNumber(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {phoneNumbers.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPhoneNumber}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Phone Number
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="school@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="principalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter principal's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="establishedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Established Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 1995" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="min-w-[200px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating School...
                        </>
                      ) : (
                        'Create School Profile'
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

export default SchoolSetup;
