import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      toast({ 
        title: 'Logout failed', 
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">VidyalayaOne</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-300 hover:bg-muted/30 ${
                  isActive(link.href)
                    ? 'text-foreground bg-muted/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-base text-muted-foreground font-medium">
                  Welcome, {user?.username}
                </span>
                <Button asChild variant="outline" size="default" className="rounded-full border-border/50 hover:border-border text-base px-6 py-3">
                  <Link to="/dashboard">Your School</Link>
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="default" className="rounded-full text-base px-6 py-3">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="default" className="rounded-full text-foreground hover:text-foreground text-base px-6 py-3">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="default" className="rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full p-3"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-in slide-in-from-top-5 duration-300">
            <div className="px-6 py-8 space-y-4 bg-background/95 backdrop-blur-xl border-t border-border/50 rounded-b-2xl mx-4 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-6 py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-foreground bg-muted/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-6 space-y-4 border-t border-border/30">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="outline" className="w-full rounded-xl py-4 text-base">
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        Your School
                      </Link>
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full rounded-xl py-4 text-base">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full rounded-xl text-foreground py-4 text-base">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full rounded-xl bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg py-4 text-base hover:-translate-y-0.5 transition-all duration-300">
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;