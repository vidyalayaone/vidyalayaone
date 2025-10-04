import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({
        username: data.username,
        password: data.password,
      });
      
      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;
        login(user, accessToken, refreshToken);
        
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        
        // Navigate to intended destination or dashboard
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
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
                    Login to Platform
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
                                  placeholder="Enter your password" 
                                  className="relative h-12 px-4 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-2 border-border/30 hover:border-muted-foreground/50 focus:border-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl text-base transition-all duration-300 placeholder:text-muted-foreground/60"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Forgot password link with style */}
                    <div className="flex items-center justify-end">
                      <Link 
                        to="/forgot-password" 
                        className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
                      >
                        <span className="relative z-10">Forgot password?</span>
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground group-hover:w-full transition-all duration-300" />
                      </Link>
                    </div>

                    {/* Creative sign in button */}
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="relative w-full h-14 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={isLoading}
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                          Submit
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Creative divider and register link */}
                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 py-2 text-muted-foreground rounded-full backdrop-blur-sm border border-border/30">
                        New to VidyalayaOne?
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      to="/register" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 text-foreground hover:text-foreground font-semibold rounded-2xl border border-border/30 hover:border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group"
                    >
                      <span>Create your account</span>
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

export default Login;