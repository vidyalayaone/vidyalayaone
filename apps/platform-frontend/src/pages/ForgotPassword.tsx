import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { authAPI } from "@/lib/api";

const ForgotPassword = () => {
  const [step, setStep] = useState<'username' | 'otp' | 'reset'>('username');
  const [formData, setFormData] = useState({
    username: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });
  const [resetToken, setResetToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(formData.username);
      toast({
        title: "Reset code sent!",
        description: "Please check your email for the password reset code.",
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Failed to send reset code",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.verifyPasswordResetOTP({
        username: formData.username,
        otp: formData.otp
      });
      
      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        toast({
          title: "Code verified!",
          description: "Please enter your new password.",
        });
        setStep('reset');
      }
    } catch (error: any) {
      toast({
        title: "Invalid code",
        description: error.message || "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({
        resetToken: resetToken,
        newPassword: formData.password
      });
      toast({
        title: "Password reset successful!",
        description: "You can now login with your new password.",
      });
      // Reset form and redirect to login
      setFormData({ username: "", otp: "", password: "", confirmPassword: "" });
      setStep('username');
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      await authAPI.resendOTP(formData.username, 'password_reset');
      toast({
        title: "Code resent!",
        description: "A new reset code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {step === 'username' && (
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              )}
              {step === 'otp' && (
                <div className="p-3 rounded-full bg-primary/10">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              )}
              {step === 'reset' && (
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {step === 'username' && "Forgot Password?"}
              {step === 'otp' && "Enter Reset Code"}
              {step === 'reset' && "Set New Password"}
            </CardTitle>
            
            <CardDescription>
              {step === 'username' && "Enter your username and we'll send you a reset code."}
              {step === 'otp' && `We've sent a reset code to your email`}
              {step === 'reset' && "Enter your new password below."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'username' && (
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Reset Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={resendOTP}
                    disabled={isLoading}
                  >
                    Didn't receive the code? Resend
                  </Button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    minLength={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;