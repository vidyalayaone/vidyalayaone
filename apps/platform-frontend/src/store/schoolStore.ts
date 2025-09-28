import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { School, SchoolClass, DetailedSchoolData } from '@/lib/api';

interface SetupProgress {
  schoolCreated: boolean;
  classesAdded: boolean;
  sectionsAdded: boolean;
  subjectsAdded: boolean;
  paymentCompleted: boolean;
}

interface SchoolState {
  school: School | null;
  classes: SchoolClass[];
  totalSections: number;
  totalSubjects: number;
  setupProgress: SetupProgress;
  isLoading: boolean;

  // Actions
  setSchoolData: (data: DetailedSchoolData) => void;
  setSchool: (school: School | null) => void;
  updateSetupProgress: (progress: Partial<SetupProgress>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  clearAll: () => void;
}

const initialSetupProgress: SetupProgress = {
  schoolCreated: false,
  classesAdded: false,
  sectionsAdded: false,
  subjectsAdded: false,
  paymentCompleted: false,
};

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      school: null,
      classes: [],
      totalSections: 0,
      totalSubjects: 0,
      setupProgress: initialSetupProgress,
      isLoading: false,

      setSchoolData: (data) => {
        set({
          school: data.school,
          classes: data.classes,
          totalSections: data.totalSections,
          totalSubjects: data.totalSubjects,
          setupProgress: data.setupProgress,
        });
      },

      setSchool: (school) => {
        set({ school });
        if (school) {
          set((state) => ({
            setupProgress: {
              ...state.setupProgress,
              schoolCreated: true,
            },
          }));
        }
      },

      updateSetupProgress: (progress) =>
        set((state) => ({
          setupProgress: { ...state.setupProgress, ...progress },
        })),
      
      setLoading: (isLoading) => set({ isLoading }),

      reset: () =>
        set({
          school: null,
          classes: [],
          totalSections: 0,
          totalSubjects: 0,
          setupProgress: initialSetupProgress,
          isLoading: false,
        }),
        // New method to clear both state and persistence
      clearAll: () => {
        // Reset the state
        set({
          school: null,
          classes: [],
          totalSections: 0,
          totalSubjects: 0,
          setupProgress: initialSetupProgress,
          isLoading: false,
        });
        
        // Clear from localStorage
        useSchoolStore.persist.clearStorage();
      },
    }),
    {
      name: 'vidyalaya-school',
      partialize: (state) => ({
        school: state.school,
        classes: state.classes,
        totalSections: state.totalSections,
        totalSubjects: state.totalSubjects,
        setupProgress: state.setupProgress,
      }),
    }
  )
);