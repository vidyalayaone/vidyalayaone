import React from 'react';
import { Bell, Menu, Search, Settings, User, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getUserFullName, getUserInitials, getRoleDisplayName } from '@/utils/auth';

const Topbar: React.FC = () => {
  const { user, school, logout } = useAuthStore();
  const { theme, toggleTheme, notifications } = useUIStore();
  const { toggleSidebar } = useSidebar();
  
  const userFullName = getUserFullName(user);
  const userInitials = getUserInitials(user);
  const roleDisplay = user ? getRoleDisplayName(user) : '';
  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    // Navigate to profile page or open profile modal
    console.log('Navigate to profile');
  };

  const handleSettingsClick = () => {
    // Navigate to settings page or open settings modal
    console.log('Open settings');
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="relative flex items-center h-full px-4 lg:px-6">
        {/* Left Section - Sidebar Toggle */}
        <div className="flex items-center">
          <SidebarTrigger />
        </div>

        {/* Center Section - School Info */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          {school?.logo && (
            <img 
              src={school.logo} 
              alt={school.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          )}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              {school?.name || 'School Portal'}
            </h1>
          </div>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;