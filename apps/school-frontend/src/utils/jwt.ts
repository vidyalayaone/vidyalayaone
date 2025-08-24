// JWT utilities for decoding tokens and extracting permissions

interface JWTPayload {
  id: string; // user ID (not sub)
  roleId: string;
  roleName: string;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expiration
}

// Simple JWT decoder (without verification - assumes backend validates)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Extract permissions from JWT token
export function getPermissionsFromToken(token: string): string[] {
  const payload = decodeJWT(token);
  return payload?.permissions || [];
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

// Get user info from token - returns basic info available in JWT
export function getUserFromToken(token: string): Partial<{ id: string; roleId: string; roleName: string; permissions: string[] }> | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    roleId: payload.roleId,
    roleName: payload.roleName,
    permissions: payload.permissions
  };
}
