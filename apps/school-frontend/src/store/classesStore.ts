// Zustand store for classes and sections data

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../api/api';
import toast from 'react-hot-toast';

// Types for class data
export interface ClassSection {
  id: string;
  name: string;
  classTeacher: string | null;
  classTeacherId: string | null;
  totalStudents: number | null;
  totalBoys: number | null;
  totalGirls: number | null;
}

export interface SchoolClass {
  id: string;
  grade: string;
  displayName: string;
  sections: ClassSection[];
}

// Backend API response types
interface BackendSection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendClass {
  id: string;
  name: string;
  sections: BackendSection[];
  createdAt: string;
  updatedAt: string;
}

interface BackendApiResponse {
  school: {
    id: string;
    name: string;
  };
  academicYear: string;
  classes: BackendClass[];
  totalClasses: number;
  totalSections: number;
  totalStudents?: number;
  totalBoys?: number;
  totalGirls?: number;
}

interface ClassesStats {
  totalClasses: number | 'N/A';
  totalSections: number | 'N/A';
  totalStudents: number | 'N/A';
  totalBoys: number | 'N/A';
  totalGirls: number | 'N/A';
}

interface ClassesState {
  // Data
  classes: SchoolClass[];
  stats: ClassesStats;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Cache management
  lastFetched: Record<string, number>; // key: schoolId-academicYear, value: timestamp
  cacheExpiry: number; // 5 minutes in milliseconds
  
  // Actions
  fetchClassesAndSections: (schoolId: string, academicYear: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  clearError: () => void;
  
  // Helper methods
  isCacheValid: (schoolId: string, academicYear: string) => boolean;
}

// Transform backend data to frontend format
const transformBackendData = (backendData: BackendApiResponse): SchoolClass[] => {
  return backendData.classes.map(backendClass => ({
    id: backendClass.id,
    grade: backendClass.name,
    displayName: backendClass.name,
    sections: backendClass.sections.map(backendSection => ({
      id: backendSection.id,
      name: backendSection.name,
      classTeacher: null, // Backend doesn't provide this yet
      classTeacherId: null, // Backend doesn't provide this yet
      totalStudents: null, // Backend doesn't provide this yet
      totalBoys: null, // Backend doesn't provide this yet
      totalGirls: null, // Backend doesn't provide this yet
    }))
  }));
};

export const useClassesStore = create<ClassesState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    classes: [],
    stats: {
      totalClasses: 'N/A',
      totalSections: 'N/A',
      totalStudents: 'N/A',
      totalBoys: 'N/A',
      totalGirls: 'N/A'
    },
    isLoading: false,
    error: null,
    lastFetched: {},
    cacheExpiry: 5 * 60 * 1000, // 5 minutes

    // Check if cache is still valid
    isCacheValid: (schoolId: string, academicYear: string): boolean => {
      const key = `${schoolId}-${academicYear}`;
      const { lastFetched, cacheExpiry } = get();
      const lastFetchTime = lastFetched[key];
      
      if (!lastFetchTime) return false;
      
      return (Date.now() - lastFetchTime) < cacheExpiry;
    },

    // Fetch classes and sections from API
    fetchClassesAndSections: async (schoolId: string, academicYear: string, forceRefresh = false): Promise<void> => {
      const { isCacheValid } = get();
      const key = `${schoolId}-${academicYear}`;

      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid(schoolId, academicYear)) {
        console.log('Using cached classes data');
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const response = await api.getClassesAndSections(schoolId, academicYear);
        
        if (response.success && response.data) {
          const transformedData = transformBackendData(response.data);
          
          set({
            classes: transformedData,
            stats: {
              totalClasses: response.data.totalClasses || 'N/A',
              totalSections: response.data.totalSections || 'N/A',
              totalStudents: response.data.totalStudents || 'N/A',
              totalBoys: response.data.totalBoys || 'N/A',
              totalGirls: response.data.totalGirls || 'N/A'
            },
            isLoading: false,
            error: null,
            lastFetched: {
              ...get().lastFetched,
              [key]: Date.now()
            }
          });
        } else {
          set({
            isLoading: false,
            error: response.message || 'Failed to fetch classes and sections'
          });
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        const errorMessage = 'Failed to load classes and sections';
        
        set({
          isLoading: false,
          error: errorMessage
        });
        
        toast.error(errorMessage);
      }
    },

    // Clear all cached data
    clearCache: (): void => {
      set({
        classes: [],
        stats: {
          totalClasses: 'N/A',
          totalSections: 'N/A',
          totalStudents: 'N/A',
          totalBoys: 'N/A',
          totalGirls: 'N/A'
        },
        lastFetched: {},
        error: null
      });
    },

    // Clear error state
    clearError: (): void => {
      set({ error: null });
    }
  }))
);
