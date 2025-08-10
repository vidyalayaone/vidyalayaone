// OTP verification form component

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const verifyOTPSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;

const VerifyOTPForm: React.FC = () => {
  const { verifyResetOTP, isLoading, resetFlow, canAccessOTPPage } = useAuthStore();
  const navigate = useNavigate();

  console.log(resetFlow);

  // Redirect if not in proper flow
  useEffect(() => {
    if (!canAccessOTPPage()) {
      navigate('/login');
    }
  }, [canAccessOTPPage, navigate]);

  const form = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: VerifyOTPFormData) => {
    const success = await verifyResetOTP(data.otp);
    
    if (success) {
      navigate('/reset-password');
    }
  };

  const handleResendOTP = async () => {
    // In a real app, you would call a resend OTP API
    console.log('Resend OTP functionality would be implemented here');
  };

  if (!resetFlow.username) {
    return null; // This should not happen due to useEffect redirect
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to the phone number 
          associated with <strong>{resetFlow.username}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the 6-digit code sent to your phone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading || form.watch('otp').length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Code
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              asChild
            >
              <Link to="/forgot-password">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </form>
      </Form>

      {/* Demo Help */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Demo mode:</strong> Use OTP <code className="bg-background px-1 rounded">123456</code> to continue
        </p>
      </div>
    </div>
  );
};

export default VerifyOTPForm;