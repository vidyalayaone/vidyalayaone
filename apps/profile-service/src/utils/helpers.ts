import { PaginationParams } from '../types';

export function getPaginationParams(page?: string, limit?: string): PaginationParams {
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
}

export function generateUsername(firstName: string, lastName: string, year?: number): string {
  const currentYear = year || new Date().getFullYear();
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  return `${cleanFirstName}.${cleanLastName}.${currentYear}`;
}

export function generateUsernameWithIncrement(baseName: string, existingUsernames: string[]): string {
  if (!existingUsernames.includes(baseName)) {
    return baseName;
  }
  
  let counter = 1;
  let newUsername = `${baseName}.${counter}`;
  
  while (existingUsernames.includes(newUsername)) {
    counter++;
    newUsername = `${baseName}.${counter}`;
  }
  
  return newUsername;
}

export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
