// Top navigation bar with school info, user menu, and controls

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
  const roleDisplay = user ? getRoleDisplayName(user.role) : '';
  
  const unreadNotifications = notifications.filter(n => !n.id).length;

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
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section - Sidebar Toggle & School Info */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          
          <div className="hidden sm:flex items-center gap-3">
            {school?.logo && (
              <img 
                src={school.logo} 
                alt={school.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {school?.name || 'School Portal'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {school?.settings?.academicYear || 'Academic Year 2024-2025'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students, classes, assignments..."
              className="pl-10 bg-background/50"
            />
          </div>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center gap-2">
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

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
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
                      {userFullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
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