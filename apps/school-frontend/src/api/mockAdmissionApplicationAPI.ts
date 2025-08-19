// Mock API for admission applications
import { StudentData } from './mockAdmissionAPI';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  studentData: StudentData;
  submittedAt: string;
  submittedBy: {
    type: 'PARENT' | 'STUDENT' | 'GUARDIAN';
    name: string;
    email: string;
    phone: string;
  };
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'ONLINE_PORTAL' | 'WALK_IN' | 'REFERRAL';
}

// Mock admission applications data
const mockApplications: AdmissionApplication[] = [
  {
    id: 'app-001',
    applicationNumber: 'ADM2024001',
    status: 'PENDING',
    studentData: {
      firstName: 'Rahul',
      lastName: 'Sharma',
      studentId: '',
      enrollmentDate: '',
      classId: 'class-10a',
      grade: '10',
      section: 'A',
      dateOfBirth: '2009-05-15',
      gender: 'MALE',
      bloodGroup: 'O+',
      email: 'rahul.sharma@email.com',
      phoneNumber: '+91-9876543210',
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      fatherName: 'Suresh Sharma',
      fatherPhone: '+91-9876543211',
      fatherEmail: 'suresh.sharma@email.com',
      fatherOccupation: 'Software Engineer',
      motherName: 'Priya Sharma',
      motherPhone: '+91-9876543212',
      motherEmail: 'priya.sharma@email.com',
      motherOccupation: 'Teacher',
      emergencyContactName: 'Suresh Sharma',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91-9876543211',
      emergencyContactEmail: 'suresh.sharma@email.com',
      allergies: 'None',
      chronicConditions: 'None',
      medications: 'None'
    },
    submittedAt: '2024-08-15T10:30:00Z',
    submittedBy: {
      type: 'PARENT',
      name: 'Suresh Sharma',
      email: 'suresh.sharma@email.com',
      phone: '+91-9876543211'
    },
    documents: [
      {
        id: 'doc-001',
        name: 'birth_certificate.pdf',
        type: 'BIRTH_CERTIFICATE',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-08-15T10:30:00Z'
      },
      {
        id: 'doc-002',
        name: 'student_photo.jpg',
        type: 'PHOTO',
        url: '/documents/student_photo.jpg',
        uploadedAt: '2024-08-15T10:30:00Z'
      }
    ],
    priority: 'HIGH',
    source: 'ONLINE_PORTAL'
  },
  {
    id: 'app-002',
    applicationNumber: 'ADM2024002',
    status: 'UNDER_REVIEW',
    studentData: {
      firstName: 'Ananya',
      lastName: 'Patel',
      studentId: '',
      enrollmentDate: '',
      classId: 'class-9a',
      grade: '9',
      section: 'A',
      dateOfBirth: '2010-03-22',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      email: 'ananya.patel@email.com',
      phoneNumber: '+91-8765432109',
      street: '456 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      fatherName: 'Kiran Patel',
      fatherPhone: '+91-8765432110',
      fatherEmail: 'kiran.patel@email.com',
      fatherOccupation: 'Doctor',
      motherName: 'Meera Patel',
      motherPhone: '+91-8765432111',
      motherEmail: 'meera.patel@email.com',
      motherOccupation: 'Nurse',
      emergencyContactName: 'Kiran Patel',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91-8765432110',
      emergencyContactEmail: 'kiran.patel@email.com',
      allergies: 'Peanuts',
      chronicConditions: 'Asthma',
      medications: 'Inhaler as needed'
    },
    submittedAt: '2024-08-14T14:15:00Z',
    submittedBy: {
      type: 'PARENT',
      name: 'Kiran Patel',
      email: 'kiran.patel@email.com',
      phone: '+91-8765432110'
    },
    reviewedAt: '2024-08-16T09:00:00Z',
    reviewedBy: 'Admin User',
    documents: [
      {
        id: 'doc-003',
        name: 'birth_certificate.pdf',
        type: 'BIRTH_CERTIFICATE',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-08-14T14:15:00Z'
      },
      {
        id: 'doc-004',
        name: 'medical_records.pdf',
        type: 'MEDICAL_RECORD',
        url: '/documents/medical_records.pdf',
        uploadedAt: '2024-08-14T14:15:00Z'
      }
    ],
    priority: 'MEDIUM',
    source: 'ONLINE_PORTAL'
  },
  {
    id: 'app-003',
    applicationNumber: 'ADM2024003',
    status: 'REJECTED',
    studentData: {
      firstName: 'Arjun',
      lastName: 'Kumar',
      studentId: '',
      enrollmentDate: '',
      classId: 'class-11a',
      grade: '11',
      section: 'A',
      dateOfBirth: '2008-11-10',
      gender: 'MALE',
      bloodGroup: 'B+',
      email: 'arjun.kumar@email.com',
      phoneNumber: '+91-7654321098',
      street: '789 Lake View',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India',
      fatherName: 'Raj Kumar',
      fatherPhone: '+91-7654321099',
      fatherEmail: 'raj.kumar@email.com',
      fatherOccupation: 'Business Owner',
      motherName: 'Sunita Kumar',
      motherPhone: '+91-7654321100',
      motherEmail: 'sunita.kumar@email.com',
      motherOccupation: 'Homemaker',
      emergencyContactName: 'Raj Kumar',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91-7654321099',
      emergencyContactEmail: 'raj.kumar@email.com',
      allergies: 'None',
      chronicConditions: 'None',
      medications: 'None'
    },
    submittedAt: '2024-08-12T16:45:00Z',
    submittedBy: {
      type: 'PARENT',
      name: 'Raj Kumar',
      email: 'raj.kumar@email.com',
      phone: '+91-7654321099'
    },
    reviewedAt: '2024-08-14T11:30:00Z',
    reviewedBy: 'Admin User',
    reviewNotes: 'Application reviewed thoroughly',
    rejectionReason: 'Insufficient documentation provided. Missing transfer certificate from previous school.',
    documents: [
      {
        id: 'doc-005',
        name: 'birth_certificate.pdf',
        type: 'BIRTH_CERTIFICATE',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-08-12T16:45:00Z'
      }
    ],
    priority: 'LOW',
    source: 'WALK_IN'
  },
  {
    id: 'app-004',
    applicationNumber: 'ADM2024004',
    status: 'APPROVED',
    studentData: {
      firstName: 'Kavya',
      lastName: 'Singh',
      studentId: 'STU2024001',
      enrollmentDate: '2024-08-17',
      classId: 'class-10b',
      grade: '10',
      section: 'B',
      dateOfBirth: '2009-07-08',
      gender: 'FEMALE',
      bloodGroup: 'AB+',
      email: 'kavya.singh@email.com',
      phoneNumber: '+91-6543210987',
      street: '321 Garden Street',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      fatherName: 'Vikram Singh',
      fatherPhone: '+91-6543210988',
      fatherEmail: 'vikram.singh@email.com',
      fatherOccupation: 'Government Officer',
      motherName: 'Anjali Singh',
      motherPhone: '+91-6543210989',
      motherEmail: 'anjali.singh@email.com',
      motherOccupation: 'Bank Manager',
      emergencyContactName: 'Vikram Singh',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91-6543210988',
      emergencyContactEmail: 'vikram.singh@email.com',
      allergies: 'Dust',
      chronicConditions: 'None',
      medications: 'Antihistamine as needed'
    },
    submittedAt: '2024-08-10T12:20:00Z',
    submittedBy: {
      type: 'PARENT',
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91-6543210988'
    },
    reviewedAt: '2024-08-13T15:45:00Z',
    reviewedBy: 'Admin User',
    reviewNotes: 'Excellent academic records and complete documentation. Approved for admission.',
    documents: [
      {
        id: 'doc-006',
        name: 'birth_certificate.pdf',
        type: 'BIRTH_CERTIFICATE',
        url: '/documents/birth_certificate.pdf',
        uploadedAt: '2024-08-10T12:20:00Z'
      },
      {
        id: 'doc-007',
        name: 'transfer_certificate.pdf',
        type: 'TRANSFER_CERTIFICATE',
        url: '/documents/transfer_certificate.pdf',
        uploadedAt: '2024-08-10T12:20:00Z'
      },
      {
        id: 'doc-008',
        name: 'academic_records.pdf',
        type: 'ACADEMIC_RECORD',
        url: '/documents/academic_records.pdf',
        uploadedAt: '2024-08-10T12:20:00Z'
      }
    ],
    priority: 'HIGH',
    source: 'REFERRAL'
  }
];

export interface ApplicationStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  thisWeek: number;
  thisMonth: number;
}

export const mockApplicationStats: ApplicationStats = {
  total: 24,
  pending: 8,
  underReview: 3,
  approved: 10,
  rejected: 3,
  thisWeek: 5,
  thisMonth: 15
};

class AdmissionApplicationAPI {
  // Simulate network delay
  private delay(ms: number = 1500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all applications with optional filtering
  async getApplications(filter?: {
    status?: string;
    priority?: string;
    source?: string;
    search?: string;
  }): Promise<AdmissionApplication[]> {
    await this.delay();
    
    let filteredApplications = [...mockApplications];
    
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        filteredApplications = filteredApplications.filter(app => app.status === filter.status);
      }
      
      if (filter.priority && filter.priority !== 'all') {
        filteredApplications = filteredApplications.filter(app => app.priority === filter.priority);
      }
      
      if (filter.source && filter.source !== 'all') {
        filteredApplications = filteredApplications.filter(app => app.source === filter.source);
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredApplications = filteredApplications.filter(app => 
          app.applicationNumber.toLowerCase().includes(searchTerm) ||
          app.studentData.firstName.toLowerCase().includes(searchTerm) ||
          app.studentData.lastName.toLowerCase().includes(searchTerm) ||
          app.submittedBy.name.toLowerCase().includes(searchTerm) ||
          app.submittedBy.email.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    // Sort by submission date (newest first)
    return filteredApplications.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  // Get application by ID
  async getApplicationById(id: string): Promise<AdmissionApplication | null> {
    await this.delay();
    const application = mockApplications.find(app => app.id === id);
    return application || null;
  }

  // Update application status
  async updateApplicationStatus(
    id: string, 
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
    notes?: string,
    rejectionReason?: string
  ): Promise<AdmissionApplication> {
    await this.delay();
    
    const applicationIndex = mockApplications.findIndex(app => app.id === id);
    if (applicationIndex === -1) {
      throw new Error('Application not found');
    }
    
    mockApplications[applicationIndex] = {
      ...mockApplications[applicationIndex],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin User',
      reviewNotes: notes,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
    };
    
    // If approved, generate student ID and enrollment date
    if (status === 'APPROVED') {
      mockApplications[applicationIndex].studentData.studentId = `STU${Date.now()}`;
      mockApplications[applicationIndex].studentData.enrollmentDate = new Date().toISOString().split('T')[0];
    }
    
    return mockApplications[applicationIndex];
  }

  // Update application data
  async updateApplicationData(id: string, studentData: Partial<StudentData>): Promise<AdmissionApplication> {
    await this.delay();
    
    const applicationIndex = mockApplications.findIndex(app => app.id === id);
    if (applicationIndex === -1) {
      throw new Error('Application not found');
    }
    
    mockApplications[applicationIndex] = {
      ...mockApplications[applicationIndex],
      studentData: {
        ...mockApplications[applicationIndex].studentData,
        ...studentData
      }
    };
    
    return mockApplications[applicationIndex];
  }

  // Get application statistics
  async getApplicationStats(): Promise<ApplicationStats> {
    await this.delay(500);
    return mockApplicationStats;
  }
}

export const applicationAPI = new AdmissionApplicationAPI();
