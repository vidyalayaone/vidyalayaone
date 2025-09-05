import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Make auth store available globally for API interceptors
    (window as any).__AUTH_STORE__ = useAuthStore;
    
    // Initialize authentication on app startup
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
