// Authentication utility functions

import { User } from '../api/types';
import { hasAnyPermission } from './permissions';

// Check if user has a specific role by name (dynamic role names)
export const hasRoleName = (user: User | null, roleName: string): boolean => {
  return user?.role?.name === roleName || user?.roleName === roleName;
};

// Check if user has any of the specified role names
export const hasAnyRoleName = (user: User | null, roleNames: string[]): boolean => {
  if (!user) return false;
  const userRoleName = user.role?.name || user.roleName;
  return roleNames.includes(userRoleName || '');
};

// Permission-based checks (preferred approach)
export const canManageUsers = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, ['USER.CREATE', 'USER.UPDATE', 'USER.DELETE']);
};

export const canViewDashboard = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, [
    'DASHBOARD.VIEW_ADMIN',
    'DASHBOARD.VIEW_TEACHER', 
    'DASHBOARD.VIEW_STUDENT'
  ]);
};

export const canManageStudents = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, ['STUDENT.CREATE', 'STUDENT.UPDATE', 'STUDENT.VIEW']);
};

export const canManageTeachers = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, ['TEACHER.CREATE', 'TEACHER.UPDATE', 'TEACHER.VIEW']);
};

export const canManageClasses = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, ['CLASS.CREATE', 'CLASS.UPDATE', 'CLASS.VIEW']);
};

export const canViewReports = (user: User | null): boolean => {
  const userPermissions = user?.permissions || user?.role?.permissions || [];
  return hasAnyPermission(userPermissions, ['REPORT.VIEW', 'ANALYTICS.VIEW']);
};

// Legacy compatibility functions - kept for backward compatibility
// These should be gradually replaced with permission-based checks
export const hasRole = (user: User | null, roleName: string): boolean => {
  return hasRoleName(user, roleName);
};

export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
  return hasAnyRoleName(user, roleNames);
};

// Legacy role checks - deprecated, use permission-based checks instead
export const isAdmin = (user: User | null): boolean => {
  return hasRoleName(user, 'Admin') || hasRoleName(user, 'ADMIN') || hasRoleName(user, 'Super Admin');
};

export const isTeacher = (user: User | null): boolean => {
  return hasRoleName(user, 'Teacher') || hasRoleName(user, 'TEACHER');
};

export const isStudent = (user: User | null): boolean => {
  return hasRoleName(user, 'Student') || hasRoleName(user, 'STUDENT');
};

// Get user's full name
export const getUserFullName = (user: User | null): string => {
  if (!user) return 'Unknown User';
  return `${user.firstName} ${user.lastName}`.trim();
};

// Get user's initials for avatar
export const getUserInitials = (user: User | null): string => {
  if (!user) return 'UU';
  
  const firstName = user.firstName?.charAt(0).toUpperCase() || '';
  const lastName = user.lastName?.charAt(0).toUpperCase() || '';
  
  return (firstName + lastName) || user.username?.charAt(0).toUpperCase() || 'U';
};

// Get role display name (dynamic)
export const getRoleDisplayName = (user: User | null): string => {
  if (!user) return 'Unknown';
  return user.role?.name || user.roleName || 'Unknown Role';
};

// Get role color for badges/indicators (dynamic based on role name)
export const getRoleColor = (user: User | null): string => {
  if (!user) return 'bg-muted text-muted-foreground';
  
  const roleName = user.role?.name || user.roleName || '';
  
  // Map common role names to colors
  if (roleName.toLowerCase().includes('admin')) {
    return 'bg-destructive text-destructive-foreground';
  } else if (roleName.toLowerCase().includes('teacher')) {
    return 'bg-primary text-primary-foreground';
  } else if (roleName.toLowerCase().includes('student')) {
    return 'bg-accent text-accent-foreground';
  } else {
    return 'bg-secondary text-secondary-foreground';
  }
};

// Format user data for display
export const formatUserForDisplay = (user: User) => {
  return {
    ...user,
    fullName: getUserFullName(user),
    initials: getUserInitials(user),
    roleDisplay: getRoleDisplayName(user),
    roleColor: getRoleColor(user)
  };
};

// Validate user permissions for specific actions
export const canPerformAction = (
  user: User | null, 
  permission: string
): boolean => {
  if (!user) return false;
  
  // Check if user has the specific permission
  const userPermissions = user.permissions || user.role?.permissions || [];
  return userPermissions.includes(permission);
};

// Check if user can access a specific resource based on permissions
export const canAccessResource = (
  user: User | null,
  requiredPermissions: string[]
): boolean => {
  if (!user) return false;
  
  const userPermissions = user.permissions || user.role?.permissions || [];
  return hasAnyPermission(userPermissions, requiredPermissions);
};

// Generate default avatar URL based on user initials
export const getDefaultAvatarUrl = (user: User | null): string => {
  if (!user) return '';
  
  const initials = getUserInitials(user);
  const colors = ['0EA5E9', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'F97316'];
  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${initials}&background=${backgroundColor}&color=fff&size=128&font-size=0.5`;
};

// Validate password strength
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

// Check if user session is valid (based on token expiry, etc.)
export const isSessionValid = (user: User | null, accessToken: string | null): boolean => {
  if (!user || !accessToken) return false;
  
  // In a real app, you would check token expiry, etc.
  // For now, just check if both exist
  return true;
};

// Get user's timezone (for date/time formatting)
export const getUserTimezone = (user: User | null): string => {
  // In a real app, this might come from user preferences
  // For now, use browser timezone as fallback
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Format date/time for user's timezone
export const formatDateForUser = (
  date: string | Date, 
  user: User | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const timezone = getUserTimezone(user);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};