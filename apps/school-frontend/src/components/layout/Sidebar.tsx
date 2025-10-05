import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getFlatNavigationForUser } from '@/config/navigation';
import { getUserInitials, getUserFullName, getRoleDisplayName } from '@/utils/auth';
import { ChevronLeft, ChevronRight, LogOut, User, Settings } from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { user, school, logout } = useAuthStore();
  const { open } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  
  const navigation = user ? getFlatNavigationForUser(user.permissions || []) : [];
  const userInitials = getUserInitials(user);
  const username = user ? user.username : 'Unknown User';
  const roleDisplay = user ? getRoleDisplayName(user) : '';

  // Check if a path is active
  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  // Get nav link classes with Apple-inspired styling
  const getNavLinkClasses = (isActive: boolean) => {
    return isActive 
      ? 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 border-r-2 border-blue-500 font-semibold shadow-lg shadow-blue-500/10 scale-[1.02]' 
      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-[1.01] transition-all duration-200 ease-out';
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    // Navigate to settings page
    console.log('Navigate to settings');
  };

  return (
    <Sidebar
      className={`border-r border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl transition-all duration-300 ease-out ${
        collapsed ? 'w-16' : 'w-72'
      }`}
      collapsible="icon"
    >
      {/* Header with school branding */}
      {!collapsed && (
        <SidebarHeader className="px-6 py-6 border-b border-neutral-100 dark:border-neutral-800 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200">
              {school?.name?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                {school?.name || 'School Portal'}
              </h2>
            </div>
          </div>
        </SidebarHeader>
      )}

      {/* Collapsed header indicator */}
      {collapsed && (
        <SidebarHeader className="px-3 py-6 flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105">
            {school?.name?.[0] || 'S'}
          </div>
        </SidebarHeader>
      )}

      {/* Navigation Content */}
      <SidebarContent className={`px-3 py-4 ${collapsed ? 'py-6' : ''}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const isActive = isActivePath(item.path);
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      className={`${getNavLinkClasses(isActive)} h-11 rounded-xl mx-1`}
                    >
                      <NavLink 
                        to={item.path} 
                        className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ease-out relative group"
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''} transition-transform duration-200 ease-out group-hover:scale-110`} />
                        
                        {!collapsed && (
                          <span className="flex-1 truncate font-medium transition-all duration-200">{item.label}</span>
                        )}
                        
                        {/* Active indicator dot for collapsed state */}
                        {collapsed && isActive && (
                          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Section Footer with Apple-inspired styling */}
      <SidebarFooter className="px-3 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="space-y-3">
          {/* User Info */}
          {user && !collapsed && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <Avatar className="w-9 h-9 ring-2 ring-white/50 dark:ring-neutral-700/50 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-neutral-900 dark:text-white">
                  {username}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {roleDisplay}
                </p>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {user && collapsed && (
            <div className="flex justify-center">
              <Avatar className="w-9 h-9 ring-2 ring-white/50 dark:ring-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className={`flex gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {/* Settings Button */}
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              onClick={handleSettings}
              className={`${collapsed ? 'w-10 h-10 rounded-xl' : 'flex-1'} justify-center gap-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              onClick={handleLogout}
              className={`${collapsed ? 'w-10 h-10 rounded-xl' : 'flex-1'} justify-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;