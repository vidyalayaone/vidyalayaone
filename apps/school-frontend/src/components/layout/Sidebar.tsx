// Sidebar navigation component with role-based menu items

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
import { getNavigationForRole } from '@/config/navigation';
import { getUserInitials, getUserFullName, getRoleDisplayName } from '@/utils/auth';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { user, school, logout } = useAuthStore();
  const { open } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  
  const navigation = user ? getNavigationForRole(user.role) : [];
  const userInitials = getUserInitials(user);
  const userFullName = getUserFullName(user);
  const roleDisplay = user ? getRoleDisplayName(user.role) : '';

  // Check if a path is active
  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  // Get nav link classes
  const getNavLinkClasses = (isActive: boolean) => {
    return isActive 
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar
      className={`border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      collapsible="icon"
    >
      {/* Header with School Logo */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {school?.logo ? (
            <img 
              src={school.logo} 
              alt={school.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground text-sm font-bold">
                {school?.name?.charAt(0) || 'S'}
              </span>
            </div>
          )}
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sidebar-foreground font-semibold text-sm truncate">
                {school?.name || 'School Portal'}
              </h2>
              <p className="text-sidebar-foreground/70 text-xs">
                Academic Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-4">
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={group.label} className="mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isActivePath(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild
                        className={getNavLinkClasses(isActive)}
                      >
                        <NavLink 
                          to={item.path} 
                          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant="secondary" 
                                  className="h-5 px-1.5 text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="space-y-3">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={userFullName} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground text-sm font-medium truncate">
                    {userFullName}
                  </p>
                  <p className="text-sidebar-foreground/70 text-xs">
                    {roleDisplay}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <>
                <Separator className="bg-sidebar-border" />
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;