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
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';

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
      {/* Navigation Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
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
      </SidebarContent>

      {/* User Section Footer */}
      <SidebarFooter className="px-2 py-4 border-t border-sidebar-border">
        <div className="space-y-2">
          {/* User Info */}
          {user && (
            <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">
                    {username}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              collapsed ? 'px-2' : 'px-3'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;