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
              <ArrowLeft className="h-4 w-4" />
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
                    {step === 'username' && "Forgot Password?"}
                    {step === 'otp' && "Enter Reset Code"}
                    {step === 'reset' && "Set New Password"}
                  </CardTitle>
                  
                  <CardDescription className="text-muted-foreground">
                    {step === 'username' && "Enter your username and we'll send you a reset code."}
                    {step === 'otp' && `We've sent a reset code to your email`}
                    {step === 'reset' && "Enter your new password below."}
                  </CardDescription>
                </div>
              </CardHeader>
            </div>
            
            <CardContent className="p-8">
              <div className="max-w-lg mx-auto">
                {step === 'username' && (
                  <form onSubmit={handleUsernameSubmit} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-semibold text-foreground">Username</Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="your_username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading ? "Sending..." : "Send Reset Code"}
                        </span>
                      </Button>
                    </div>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleOTPSubmit} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-semibold text-foreground">Reset Code</Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="otp"
                            name="otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={formData.otp}
                            onChange={handleInputChange}
                            maxLength={6}
                            className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading ? "Verifying..." : "Verify Code"}
                        </span>
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={resendOTP}
                        disabled={isLoading}
                        className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
                      >
                        <span className="relative z-10">Didn't receive the code? Resend</span>
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300" />
                      </Button>
                    </div>
                  </form>
                )}

                {step === 'reset' && (
                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-foreground">New Password</Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleInputChange}
                            minLength={6}
                            className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm New Password</Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            minLength={6}
                            className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading ? "Resetting..." : "Reset Password"}
                        </span>
                      </Button>
                    </div>
                  </form>
                )}

                {/* Creative divider and sign in link */}
                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 py-2 text-muted-foreground rounded-full backdrop-blur-sm border border-border/30">
                        Remember your password?
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

export default ForgotPassword;