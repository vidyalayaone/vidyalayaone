import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type OTPForm = z.infer<typeof otpSchema>;

const VerifyOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const username = location.state?.username;
  const type = location.state?.type; // 'registration' or 'password-reset'

  useEffect(() => {
    if (!username || !type) {
      navigate('/login');
    }
  }, [username, type, navigate]);

  const form = useForm<OTPForm>({
    resolver: zodResolver(otpSchema as any),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: OTPForm) => {
    setIsLoading(true);
    try {
      if (type === 'registration') {
        await authAPI.verifyRegistrationOTP({ username, otp: data.otp });
        toast({
          title: 'Email verified successfully!',
          description: 'You can now sign in to your account.',
        });
        navigate('/login');
      } else if (type === 'password-reset') {
        const response = await authAPI.verifyPasswordResetOTP({ username, otp: data.otp });
        toast({
          title: 'OTP verified successfully!',
          description: 'You can now reset your password.',
        });
        navigate('/reset-password', { state: { resetToken: response.data?.resetToken } });
      }
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await authAPI.resendOTP(username, type === 'registration' ? 'registration' : 'password_reset');
      toast({
        title: 'OTP sent successfully!',
        description: 'Please check your email for the new verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resend OTP',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!username || !type) {
    return null;
  }

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
        {/* Back to Login - positioned outside the card */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-foreground/80 hover:bg-white/10 rounded-xl">
            <Link to="/login" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        {/* Creative form with advanced glassmorphism */}
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/10 rounded-3xl blur-xl transform rotate-1" />
          
          <Card className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            {/* Card header with gradient */}
            <div className="relative bg-gradient-to-r from-muted/5 to-muted/5 border-b border-white/10">
              <CardHeader className="space-y-2 py-6">
                <div className="text-center space-y-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Verify Your Email
                  </CardTitle>
                  
                  <CardDescription className="text-muted-foreground">
                    Enter the 6-digit code sent to your email
                  </CardDescription>
                </div>
              </CardHeader>
            </div>

            <CardContent className="p-8">
              <div className="max-w-lg mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-2">
                              <FormLabel className="text-sm font-semibold text-foreground">Verification Code</FormLabel>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <FormControl>
                                  <Input 
                                    placeholder="Enter 6-digit code" 
                                    {...field} 
                                    className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60 text-center text-xl tracking-widest"
                                    maxLength={6}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                          {isLoading ? "Verifying..." : "Verify Code"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Didn't receive the code? Resend
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300" />
                  </Button>
                </div>

                {/* Creative divider and sign in link */}
                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 py-2 text-muted-foreground rounded-full backdrop-blur-sm border border-border/30">
                        Already verified?
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

export default VerifyOTP;