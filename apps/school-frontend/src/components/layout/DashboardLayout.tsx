// Main dashboard layout with sidebar - Clean Apple-inspired design

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './Sidebar';
import { useUIStore } from '@/store/uiStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="min-h-screen flex w-full bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <AppSidebar />
        
        {/* Main content area - full height, clean layout */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-8 py-10 lg:px-12 lg:py-12">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;