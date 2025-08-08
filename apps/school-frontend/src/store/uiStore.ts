// Zustand store for UI state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  createdAt: number;
}

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme state
  theme: 'light' | 'dark';
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  globalLoading: boolean;
  
  // Modal/Dialog states
  modals: {
    profileEdit: boolean;
    settingsOpen: boolean;
    confirmDialog: {
      open: boolean;
      title?: string;
      message?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
    };
  };
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  setGlobalLoading: (loading: boolean) => void;
  
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  
  openConfirmDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'light',
      notifications: [],
      globalLoading: false,
      modals: {
        profileEdit: false,
        settingsOpen: false,
        confirmDialog: {
          open: false,
        },
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebarCollapse: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Theme actions
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const { theme, setTheme } = get();
        setTheme(theme === 'light' ? 'dark' : 'light');
      },

      // Notification actions
      addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: Date.now(),
          duration: notification.duration || 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Global loading
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      // Modal actions
      openModal: (modal: keyof UIState['modals']) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: modal === 'confirmDialog' ? state.modals[modal] : true,
          },
        }));
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: modal === 'confirmDialog' 
              ? { open: false }
              : false,
          },
        }));
      },

      openConfirmDialog: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
      }) => {
        set((state) => ({
          modals: {
            ...state.modals,
            confirmDialog: {
              open: true,
              title: config.title,
              message: config.message,
              onConfirm: config.onConfirm,
              onCancel: config.onCancel,
            },
          },
        }));
      },

      closeConfirmDialog: () => {
        set((state) => ({
          modals: {
            ...state.modals,
            confirmDialog: {
              open: false,
            },
          },
        }));
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Initialize theme on store creation
const initialTheme = useUIStore.getState().theme;
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Utility functions for common UI operations
export const uiUtils = {
  // Show success notification
  showSuccess: (title: string, message?: string) => {
    return useUIStore.getState().addNotification({
      type: 'success',
      title,
      message,
    });
  },

  // Show error notification
  showError: (title: string, message?: string) => {
    return useUIStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 7000, // Show errors longer
    });
  },

  // Show warning notification
  showWarning: (title: string, message?: string) => {
    return useUIStore.getState().addNotification({
      type: 'warning',
      title,
      message,
    });
  },

  // Show info notification
  showInfo: (title: string, message?: string) => {
    return useUIStore.getState().addNotification({
      type: 'info',
      title,
      message,
    });
  },

  // Confirm action with dialog
  confirmAction: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    useUIStore.getState().openConfirmDialog({
      title,
      message,
      onConfirm,
      onCancel,
    });
  },
};