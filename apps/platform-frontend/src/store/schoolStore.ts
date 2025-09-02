import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { School, ClassSection, Subject } from '@/lib/api';

interface SetupProgress {
  schoolCreated: boolean;
  classesAdded: boolean;
  sectionsAdded: boolean;
  subjectsAdded: boolean;
  paymentCompleted: boolean;
}

interface SchoolState {
  school: School | null;
  setupProgress: SetupProgress;
  classesSections: ClassSection[];
  subjects: Subject[];
  availableSubjects: Record<string, string[]>;
  isLoading: boolean;

  // Actions
  setSchool: (school: School | null) => void;
  updateSetupProgress: (progress: Partial<SetupProgress>) => void;
  setClassesSections: (classesSections: ClassSection[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setAvailableSubjects: (subjects: Record<string, string[]>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
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
      setupProgress: initialSetupProgress,
      classesSections: [],
      subjects: [],
      availableSubjects: {},
      isLoading: false,

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

      setClassesSections: (classesSections) => set({ classesSections }),
      
      setSubjects: (subjects) => set({ subjects }),
      
      setAvailableSubjects: (availableSubjects) => set({ availableSubjects }),
      
      setLoading: (isLoading) => set({ isLoading }),

      reset: () =>
        set({
          school: null,
          setupProgress: initialSetupProgress,
          classesSections: [],
          subjects: [],
          availableSubjects: {},
          isLoading: false,
        }),
    }),
    {
      name: 'vidyalaya-school',
      partialize: (state) => ({
        school: state.school,
        setupProgress: state.setupProgress,
        classesSections: state.classesSections,
        subjects: state.subjects,
      }),
    }
  )
);