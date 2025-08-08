// Authentication utility functions

import { User } from '../api/types';

// Check if user has specific role
export const hasRole = (user: User | null, role: 'ADMIN' | 'TEACHER' | 'STUDENT'): boolean => {
  return user?.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user: User | null, roles: ('ADMIN' | 'TEACHER' | 'STUDENT')[]): boolean => {
  return user ? roles.includes(user.role) : false;
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

// Check if user is teacher
export const isTeacher = (user: User | null): boolean => {
  return hasRole(user, 'TEACHER');
};

// Check if user is student
export const isStudent = (user: User | null): boolean => {
  return hasRole(user, 'STUDENT');
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

// Get role display name
export const getRoleDisplayName = (role: 'ADMIN' | 'TEACHER' | 'STUDENT'): string => {
  const roleNames = {
    ADMIN: 'Administrator',
    TEACHER: 'Teacher',
    STUDENT: 'Student'
  };
  
  return roleNames[role] || role;
};

// Get role color for badges/indicators
export const getRoleColor = (role: 'ADMIN' | 'TEACHER' | 'STUDENT'): string => {
  const roleColors = {
    ADMIN: 'bg-destructive text-destructive-foreground',
    TEACHER: 'bg-primary text-primary-foreground',
    STUDENT: 'bg-accent text-accent-foreground'
  };
  
  return roleColors[role] || 'bg-muted text-muted-foreground';
};

// Format user data for display
export const formatUserForDisplay = (user: User) => {
  return {
    ...user,
    fullName: getUserFullName(user),
    initials: getUserInitials(user),
    roleDisplay: getRoleDisplayName(user.role),
    roleColor: getRoleColor(user.role)
  };
};

// Validate user permissions for specific actions
export const canPerformAction = (
  user: User | null, 
  action: string, 
  resource?: string
): boolean => {
  if (!user) return false;
  
  // Admin can do everything
  if (isAdmin(user)) return true;
  
  // Define role-based permissions
  const permissions = {
    TEACHER: {
      'view:students': true,
      'view:classes': true,
      'create:assignments': true,
      'grade:assignments': true,
      'mark:attendance': true,
      'view:reports': true,
      'send:messages': true,
    },
    STUDENT: {
      'view:own_grades': true,
      'view:own_classes': true,
      'submit:assignments': true,
      'view:own_attendance': true,
      'receive:messages': true,
    }
  };
  
  const userPermissions = permissions[user.role as keyof typeof permissions] || {};
  return userPermissions[action as keyof typeof userPermissions] || false;
};

// Check if user can access a specific resource
export const canAccessResource = (
  user: User | null,
  resourceType: string,
  resourceId?: string
): boolean => {
  if (!user) return false;
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // Add resource-specific access logic here
  switch (resourceType) {
    case 'user_profile':
      // Users can access their own profile
      return resourceId === user.id;
    
    case 'class':
      // Teachers can access their classes, students can access their enrolled classes
      // This would need to check against actual class enrollment/assignment data
      return true; // Simplified for now
    
    case 'assignment':
      // Similar logic for assignments
      return true; // Simplified for now
    
    default:
      return false;
  }
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