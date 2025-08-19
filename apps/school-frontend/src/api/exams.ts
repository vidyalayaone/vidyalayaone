// Mock API functions for exams - can be replaced with real API later

// Types
export interface Exam {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed';
  totalClasses: number;
  totalSections: number;
  selectedSections: Array<{
    id: string;
    grade: string;
    section: string;
  }>;
  createdAt: string;
  isScheduled: boolean;
  isFinalised: boolean;
  description?: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isFinalised: boolean;
  timetable: Record<string, Record<string, string>>;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
}

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    name: 'Half Yearly Examination',
    startDate: '2024-09-15',
    endDate: '2024-09-25',
    status: 'scheduled',
    totalClasses: 15,
    totalSections: 30,
    selectedSections: [
      { id: '10-A', grade: '10', section: 'A' },
      { id: '10-B', grade: '10', section: 'B' },
      { id: '12-A', grade: '12', section: 'A' },
      { id: '12-B', grade: '12', section: 'B' }
    ],
    createdAt: '2024-08-15T10:00:00Z',
    isScheduled: false,
    isFinalised: false,
    description: 'Half yearly examination for all selected classes and sections.'
  },
  {
    id: '2',
    name: 'Annual Examination',
    startDate: '2024-12-05',
    endDate: '2024-12-20',
    status: 'scheduled',
    totalClasses: 15,
    totalSections: 30,
    selectedSections: [
      { id: '1-A', grade: '1', section: 'A' },
      { id: '1-B', grade: '1', section: 'B' },
      { id: '2-A', grade: '2', section: 'A' },
      { id: '2-B', grade: '2', section: 'B' }
    ],
    createdAt: '2024-08-10T10:00:00Z',
    isScheduled: true,
    isFinalised: true,
    description: 'Annual examination for academic year 2024-25.'
  },
  {
    id: '3',
    name: 'Monthly Test - October',
    startDate: '2024-10-15',
    endDate: '2024-10-18',
    status: 'completed',
    totalClasses: 12,
    totalSections: 24,
    selectedSections: [
      { id: '6-A', grade: '6', section: 'A' },
      { id: '6-B', grade: '6', section: 'B' },
      { id: '7-A', grade: '7', section: 'A' },
      { id: '7-B', grade: '7', section: 'B' }
    ],
    createdAt: '2024-08-05T10:00:00Z',
    isScheduled: true,
    isFinalised: true,
    description: 'Monthly assessment test for October.'
  }
];

const mockClasses = [
  {
    id: '1',
    grade: '1',
    sections: [
      { id: '1-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '1-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] }
    ]
  },
  {
    id: '2',
    grade: '2',
    sections: [
      { id: '2-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '2-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] }
    ]
  },
  {
    id: '6',
    grade: '6',
    sections: [
      { id: '6-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] },
      { id: '6-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] }
    ]
  },
  {
    id: '7',
    grade: '7',
    sections: [
      { id: '7-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] },
      { id: '7-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] }
    ]
  },
  {
    id: '10',
    grade: '10',
    sections: [
      { id: '10-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'] },
      { id: '10-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Commerce'] }
    ]
  },
  {
    id: '12',
    grade: '12',
    sections: [
      { id: '12-A', name: 'A', subjects: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'] },
      { id: '12-B', name: 'B', subjects: ['English', 'Mathematics', 'Economics', 'Business Studies', 'Accountancy'] }
    ]
  }
];

// API Functions
export const examAPI = {
  // Get all exams
  getExams: async (): Promise<Exam[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockExams;
  },

  // Get exam by ID
  getExam: async (id: string): Promise<Exam | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockExams.find(exam => exam.id === id) || null;
  },

  // Create new exam
  createExam: async (examData: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newExam: Exam = {
      ...examData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    mockExams.unshift(newExam);
    return newExam;
  },

  // Update exam
  updateExam: async (id: string, examData: Partial<Exam>): Promise<Exam | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockExams.findIndex(exam => exam.id === id);
    if (index === -1) return null;
    
    mockExams[index] = { ...mockExams[index], ...examData };
    return mockExams[index];
  },

  // Delete exam
  deleteExam: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockExams.findIndex(exam => exam.id === id);
    if (index === -1) return false;
    
    mockExams.splice(index, 1);
    return true;
  },

  // Get available classes and sections
  getClassesAndSections: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockClasses;
  },

  // Get subjects for a class
  getSubjectsForClass: async (classId: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    for (const cls of mockClasses) {
      const section = cls.sections.find(s => s.id === classId);
      if (section) {
        return section.subjects;
      }
    }
    return [];
  }
};

// Time Slots API
export const timeSlotAPI = {
  // Get time slots for an exam
  getTimeSlots: async (examId: string): Promise<TimeSlot[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would filter by examId
    return [
      {
        id: '1',
        name: 'Morning Session',
        startTime: '09:00',
        endTime: '12:00',
        isFinalised: true,
        timetable: {
          '10-A': {
            '2024-09-15': 'Mathematics',
            '2024-09-16': 'English',
            '2024-09-17': 'Science'
          },
          '10-B': {
            '2024-09-15': 'Mathematics',
            '2024-09-16': 'English',
            '2024-09-17': 'Science'
          }
        }
      },
      {
        id: '2',
        name: 'Afternoon Session',
        startTime: '14:00',
        endTime: '17:00',
        isFinalised: false,
        timetable: {
          '12-A': {
            '2024-09-15': 'Physics',
            '2024-09-16': '',
            '2024-09-17': 'Chemistry'
          },
          '12-B': {
            '2024-09-15': 'Economics',
            '2024-09-16': 'Business Studies',
            '2024-09-17': ''
          }
        }
      }
    ];
  },

  // Create time slot
  createTimeSlot: async (examId: string, timeSlotData: Omit<TimeSlot, 'id'>): Promise<TimeSlot> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTimeSlot: TimeSlot = {
      ...timeSlotData,
      id: Date.now().toString(),
    };
    
    return newTimeSlot;
  },

  // Update time slot
  updateTimeSlot: async (examId: string, timeSlotId: string, timeSlotData: Partial<TimeSlot>): Promise<TimeSlot | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In a real app, this would update the time slot in the database
    return {
      id: timeSlotId,
      name: timeSlotData.name || 'Updated Slot',
      startTime: timeSlotData.startTime || '09:00',
      endTime: timeSlotData.endTime || '12:00',
      isFinalised: timeSlotData.isFinalised || false,
      timetable: timeSlotData.timetable || {}
    };
  },

  // Finalise time slot
  finaliseTimeSlot: async (examId: string, timeSlotId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return true;
  }
};

export default examAPI;
