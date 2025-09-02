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
import { Loader2, GraduationCap, Mail } from 'lucide-react';

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
          title: 'Phone verified successfully!',
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
        description: 'Please check your phone for the new verification code.',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Phone</h1>
          <p className="text-white/80">Enter the 6-digit code sent to your phone</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-large">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Enter Verification Code</CardTitle>
            <CardDescription className="text-center">
              We sent a verification code to your phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter 6-digit code" 
                          {...field} 
                          className="text-center text-xl tracking-widest"
                          maxLength={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button 
                onClick={handleResendOTP} 
                variant="ghost" 
                className="text-primary"
                disabled={isResending}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Code
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;