// Layout component for authentication pages (login, password reset, etc.)

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  description,
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-muted/10 opacity-30" />
      
      <div className="relative w-full max-w-md mx-auto">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {showLogo && (
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-primary">
                  <svg
                    className="w-8 h-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {children}
          </CardContent>
        </Card>
        
        {/* School Name Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm font-medium">
            Riverside Academy
          </p>
          <p className="text-white/60 text-xs mt-1">
            Excellence in Education Since 1985
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;