import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must not exceed 50 characters'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const { startPasswordReset, isLoading, school } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema as any),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    const success = await startPasswordReset(data.username);
    
    if (success) {
      navigate('/verify-otp');
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
                <div className="text-center space-y-4">
                  {/* School Logo */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Forgot Password
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Enter your username to receive a password reset code
                  </p>
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
                            <FormDescription className="text-xs text-muted-foreground">
                              Enter your username to receive a password reset OTP
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                          {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 rounded-2xl transition-all duration-300"
                        asChild
                      >
                        <Link to="/login">
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Back to Login
                        </Link>
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Help section */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/10 rounded-2xl blur-sm" />
                    <div className="relative bg-gradient-to-r from-muted/10 to-muted/5 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Need help?</strong> Contact your school administrator or IT support 
                        if you're unable to reset your password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* School Name Footer */}
        {school?.name && (
          <div className="text-center mt-6">
            <p className="text-muted-foreground/80 text-sm font-medium">
              {school.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;