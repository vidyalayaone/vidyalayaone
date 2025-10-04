import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      toast({
        title: 'Registration successful!',
        description: 'Please check your email for verification code.',
      });
      
      // Navigate to OTP verification with username
      navigate('/verify-otp', { state: { username: data.username, type: 'registration' } });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-accent/8 via-transparent to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-0" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-accent/60 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse delay-2000" />
      </div>
      
      <div className="relative w-full max-w-3xl mx-auto p-6 flex flex-col justify-center min-h-screen py-12">
        {/* Creative form with advanced glassmorphism */}
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/10 rounded-3xl blur-xl transform rotate-1" />
          
          <Card className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            {/* Card header with gradient */}
            <div className="relative bg-gradient-to-r from-muted/5 to-muted/5 border-b border-white/10">
              <CardHeader className="space-y-2 py-6">
                <div className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Create Your Account
                  </CardTitle>
                </div>
              </CardHeader>
            </div>
            
            <CardContent className="p-8">
              <div className="max-w-lg mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Creative input fields */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-foreground">
                              Username
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Input 
                                  placeholder="Enter your username" 
                                  className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-foreground">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email address" 
                                  className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-foreground">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-foreground">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Input 
                                  type="password" 
                                  placeholder="Confirm your password" 
                                  className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="space-y-3 pt-2">
                            <div className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="h-5 w-5 rounded-none flex-shrink-0"
                                />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center">
                                  I agree to the{' '}
                                  <Link 
                                    to="/terms" 
                                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors mx-1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Terms of Service
                                  </Link>
                                  {' '}and{' '}
                                  <Link 
                                    to="/privacy" 
                                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors mx-1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Privacy Policy
                                  </Link>
                                  .
                                </FormLabel>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Creative create account button */}
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading || !form.watch('agreeToTerms')}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                          Create Account
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Creative divider and login link */}
                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 py-2 text-muted-foreground rounded-full backdrop-blur-sm border border-border/30">
                        Already have an account?
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 text-foreground hover:text-foreground font-semibold rounded-2xl border border-border/30 hover:border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group"
                    >
                      <span>Sign in to your account</span>
                      <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;