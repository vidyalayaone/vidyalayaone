import React from 'react';
import { Bell, Menu, Search, Settings, User, LogOut, Moon, Sun, MoreHorizontal } from 'lucide-react';
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

  const handleNotificationsClick = () => {
    // Open notifications panel
    console.log('Open notifications');
  };

  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      <div className="relative flex items-center h-full px-6">
        {/* Left Section - Sidebar Toggle */}
        <div className="flex items-center">
          <SidebarTrigger className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200" />
        </div>

        {/* Center Section - School Info */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {school?.name?.[0] || 'S'}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
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
            className="md:hidden w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationsClick}
            className="relative w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          >
            <Bell className="w-4 h-4" />
            {notifications && notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 hover:bg-red-500 border-2 border-white dark:border-neutral-900">
                {notifications.length > 9 ? '9+' : notifications.length}
              </Badge>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-10 px-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              >
                <Avatar className="w-7 h-7 ring-2 ring-neutral-200 dark:ring-neutral-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {userFullName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {roleDisplay}
                  </p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-neutral-200 dark:ring-neutral-700">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">
                      {userFullName}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {roleDisplay}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />
              
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">View Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;