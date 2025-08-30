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

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={userFullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {roleDisplay}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {/* Theme Toggle (Mobile) */}
                <DropdownMenuItem 
                  onClick={toggleTheme}
                  className="sm:hidden"
                >
                  {theme === 'light' ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span>Toggle theme</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;