// Zustand store for section details, students, and timetable data

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../api/api';
import toast from 'react-hot-toast';

// Types for section data
export interface SectionDetails {
  id: string;
  name: string;
  classTeacherId: string | null;
  metaData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  academicYear: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
}

export interface SectionStats {
  totalStudents: number;
  totalSubjects: number;
  classTeacher: { id: string; name: string } | null;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: string;
  // Add more student fields as needed
}

export interface TimetablePeriod {
  id: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface WeeklyTimetable {
  monday: TimetablePeriod[];
  tuesday: TimetablePeriod[];
  wednesday: TimetablePeriod[];
  thursday: TimetablePeriod[];
  friday: TimetablePeriod[];
}

export interface TimetableMetadata {
  weekStartsOn: string;
  totalPeriods: number;
  breakTimes: Array<{
    name: string;
    startTime: string;
    endTime: string;
  }>;
  lastUpdated: string;
}

// API Response types
export interface SectionDetailsResponse {
  section: SectionDetails;
  class: ClassInfo;
  school: SchoolInfo;
  stats: SectionStats;
}

export interface SectionStudentsResponse {
  students: Student[];
  section: { id: string; name: string };
  class: ClassInfo;
  totalStudents: number;
}

export interface SectionTimetableResponse {
  timetable: WeeklyTimetable;
  section: { id: string; name: string };
  class: ClassInfo;
  metadata: TimetableMetadata;
}

interface SectionsState {
  // Current section data
  currentSection: {
    details: SectionDetailsResponse | null;
    students: SectionStudentsResponse | null;
    timetable: SectionTimetableResponse | null;
  };
  
  // Loading states
  loading: {
    details: boolean;
    students: boolean;
    timetable: boolean;
  };
  
  // Error states
  errors: {
    details: string | null;
    students: string | null;
    timetable: string | null;
  };
  
  // Cache management
  cache: {
    details: Record<string, { data: SectionDetailsResponse; timestamp: number }>;
    students: Record<string, { data: SectionStudentsResponse; timestamp: number }>;
    timetable: Record<string, { data: SectionTimetableResponse; timestamp: number }>;
  };
  cacheExpiry: number; // 5 minutes in milliseconds
  
  // Actions
  fetchSectionDetails: (schoolId: string, classId: string, sectionId: string, forceRefresh?: boolean) => Promise<void>;
  fetchSectionStudents: (schoolId: string, classId: string, sectionId: string, forceRefresh?: boolean) => Promise<void>;
  fetchSectionTimetable: (schoolId: string, classId: string, sectionId: string, forceRefresh?: boolean) => Promise<void>;
  fetchAllSectionData: (schoolId: string, classId: string, sectionId: string, forceRefresh?: boolean) => Promise<void>;
  updateClassTeacher: (teacherId: string, teacherName: string) => void;
  
  // Cache management
  clearCache: (type?: 'details' | 'students' | 'timetable') => void;
  clearErrors: () => void;
  clearCurrentSection: () => void;
  
  // Helper methods
  isCacheValid: (type: 'details' | 'students' | 'timetable', key: string) => boolean;
  getCacheKey: (schoolId: string, classId: string, sectionId: string) => string;
}

export const useSectionsStore = create<SectionsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentSection: {
      details: null,
      students: null,
      timetable: null,
    },
    
    loading: {
      details: false,
      students: false,
      timetable: false,
    },
    
    errors: {
      details: null,
      students: null,
      timetable: null,
    },
    
    cache: {
      details: {},
      students: {},
      timetable: {},
    },
    
    cacheExpiry: 5 * 60 * 1000, // 5 minutes

    // Helper methods
    getCacheKey: (schoolId: string, classId: string, sectionId: string): string => {
      return `${schoolId}-${classId}-${sectionId}`;
    },

    isCacheValid: (type: 'details' | 'students' | 'timetable', key: string): boolean => {
      const { cache, cacheExpiry } = get();
      const cachedItem = cache[type][key];
      
      if (!cachedItem) return false;
      
      return (Date.now() - cachedItem.timestamp) < cacheExpiry;
    },

    // Fetch section details
    fetchSectionDetails: async (schoolId: string, classId: string, sectionId: string, forceRefresh = false): Promise<void> => {
      const { getCacheKey, isCacheValid, cache } = get();
      const key = getCacheKey(schoolId, classId, sectionId);

      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid('details', key)) {
        console.log('Using cached section details');
        set(state => ({
          currentSection: {
            ...state.currentSection,
            details: cache.details[key].data
          }
        }));
        return;
      }

      set(state => ({
        loading: { ...state.loading, details: true },
        errors: { ...state.errors, details: null }
      }));

      try {
        const response = await api.getSectionDetails(schoolId, classId, sectionId);
        
        if (response.success && response.data) {
          const sectionDetails = response.data as SectionDetailsResponse;
          
          set(state => ({
            currentSection: {
              ...state.currentSection,
              details: sectionDetails
            },
            loading: { ...state.loading, details: false },
            cache: {
              ...state.cache,
              details: {
                ...state.cache.details,
                [key]: { data: sectionDetails, timestamp: Date.now() }
              }
            }
          }));
        } else {
          throw new Error(response.message || 'Failed to fetch section details');
        }
      } catch (err) {
        console.error('Error fetching section details:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load section details';
        
        set(state => ({
          loading: { ...state.loading, details: false },
          errors: { ...state.errors, details: errorMessage }
        }));
        
        toast.error(errorMessage);
      }
    },

    // Fetch section students
    fetchSectionStudents: async (schoolId: string, classId: string, sectionId: string, forceRefresh = false): Promise<void> => {
      const { getCacheKey, isCacheValid, cache } = get();
      const key = getCacheKey(schoolId, classId, sectionId);

      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid('students', key)) {
        console.log('Using cached section students');
        set(state => ({
          currentSection: {
            ...state.currentSection,
            students: cache.students[key].data
          }
        }));
        return;
      }

      set(state => ({
        loading: { ...state.loading, students: true },
        errors: { ...state.errors, students: null }
      }));

      try {
        const response = await api.getSectionStudents(schoolId, classId, sectionId);
        
        if (response.success && response.data) {
          const sectionStudents = response.data as SectionStudentsResponse;
          
          set(state => ({
            currentSection: {
              ...state.currentSection,
              students: sectionStudents
            },
            loading: { ...state.loading, students: false },
            cache: {
              ...state.cache,
              students: {
                ...state.cache.students,
                [key]: { data: sectionStudents, timestamp: Date.now() }
              }
            }
          }));
        } else {
          throw new Error(response.message || 'Failed to fetch section students');
        }
      } catch (err) {
        console.error('Error fetching section students:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load section students';
        
        set(state => ({
          loading: { ...state.loading, students: false },
          errors: { ...state.errors, students: errorMessage }
        }));
        
        toast.error(errorMessage);
      }
    },

    // Fetch section timetable
    fetchSectionTimetable: async (schoolId: string, classId: string, sectionId: string, forceRefresh = false): Promise<void> => {
      const { getCacheKey, isCacheValid, cache } = get();
      const key = getCacheKey(schoolId, classId, sectionId);

      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid('timetable', key)) {
        console.log('Using cached section timetable');
        set(state => ({
          currentSection: {
            ...state.currentSection,
            timetable: cache.timetable[key].data
          }
        }));
        return;
      }

      set(state => ({
        loading: { ...state.loading, timetable: true },
        errors: { ...state.errors, timetable: null }
      }));

      try {
        const response = await api.getSectionTimetable(schoolId, classId, sectionId);
        
        if (response.success && response.data) {
          const sectionTimetable = response.data as SectionTimetableResponse;
          
          set(state => ({
            currentSection: {
              ...state.currentSection,
              timetable: sectionTimetable
            },
            loading: { ...state.loading, timetable: false },
            cache: {
              ...state.cache,
              timetable: {
                ...state.cache.timetable,
                [key]: { data: sectionTimetable, timestamp: Date.now() }
              }
            }
          }));
        } else {
          throw new Error(response.message || 'Failed to fetch section timetable');
        }
      } catch (err) {
        console.error('Error fetching section timetable:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load section timetable';
        
        set(state => ({
          loading: { ...state.loading, timetable: false },
          errors: { ...state.errors, timetable: errorMessage }
        }));
        
        toast.error(errorMessage);
      }
    },

    // Fetch all section data at once
    fetchAllSectionData: async (schoolId: string, classId: string, sectionId: string, forceRefresh = false): Promise<void> => {
      const { fetchSectionDetails, fetchSectionStudents } = get();
      
      // Execute all fetches in parallel
      await Promise.allSettled([
        fetchSectionDetails(schoolId, classId, sectionId, forceRefresh),
        fetchSectionStudents(schoolId, classId, sectionId, forceRefresh),
      ]);
    },

    // Clear cache
    clearCache: (type?: 'details' | 'students' | 'timetable'): void => {
      if (type) {
        set(state => ({
          cache: {
            ...state.cache,
            [type]: {}
          }
        }));
      } else {
        set(state => ({
          cache: {
            details: {},
            students: {},
            timetable: {}
          }
        }));
      }
    },

    // Clear errors
    clearErrors: (): void => {
      set({
        errors: {
          details: null,
          students: null,
          timetable: null,
        }
      });
    },

    // Update class teacher in current section details
    updateClassTeacher: (teacherId: string, teacherName: string): void => {
      set((state) => {
        if (!state.currentSection.details) return state;
        
        return {
          ...state,
          currentSection: {
            ...state.currentSection,
            details: {
              ...state.currentSection.details,
              section: {
                ...state.currentSection.details.section,
                classTeacherId: teacherId,
              },
              stats: {
                ...state.currentSection.details.stats,
                classTeacher: { id: teacherId, name: teacherName },
              },
            },
          },
        };
      });
    },

    // Clear current section data
    clearCurrentSection: (): void => {
      set({
        currentSection: {
          details: null,
          students: null,
          timetable: null,
        },
        loading: {
          details: false,
          students: false,
          timetable: false,
        },
        errors: {
          details: null,
          students: null,
          timetable: null,
        }
      });
    },
  }))
);
