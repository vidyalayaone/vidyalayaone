// Mock API for admission functionality
// This file simulates backend API calls and can be easily replaced with real API calls

export interface StudentData {
  firstName: string;
  lastName: string;
  studentId: string;
  enrollmentDate: string;
  classId: string;
  grade: string;
  section: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  email?: string;
  phoneNumber?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fatherName: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail?: string;
  allergies?: string;
  chronicConditions?: string;
  medications?: string;
  doctorName?: string;
  doctorPhone?: string;
  healthInsurance?: string;
}

export interface ImportedStudentData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  phoneNumber: string;
  email: string;
  grade: string;
  section: string;
  address: string;
  bloodGroup: string;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
}

export interface AdmissionResponse {
  success: boolean;
  message: string;
  studentId?: string;
  successCount?: number;
}

export interface ValidationResponse {
  success: boolean;
  data?: ImportedStudentData[];
  message: string;
}

class MockAdmissionAPI {
  // Simulate network delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Single student admission
  async admitSingleStudent(data: StudentData): Promise<AdmissionResponse> {
    await this.delay(1500);
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        studentId: `STU${Date.now()}`,
        message: 'Student admitted successfully!'
      };
    } else {
      return {
        success: false,
        message: 'Failed to admit student. Please try again.'
      };
    }
  }

  // Multiple students admission
  async admitMultipleStudents(students: Partial<StudentData>[]): Promise<AdmissionResponse> {
    await this.delay(2000);
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        successCount: students.length,
        message: `Successfully admitted ${students.length} students!`
      };
    } else {
      return {
        success: false,
        message: 'Failed to admit some students. Please review and try again.'
      };
    }
  }

  // File validation for bulk import
  async validateImportFile(file: File): Promise<ValidationResponse> {
    await this.delay(2000);
    
    // Mock validation result with mixed data
    const mockData: ImportedStudentData[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '2008-05-15',
        gender: 'MALE',
        fatherName: 'Robert Smith',
        motherName: 'Mary Smith',
        phoneNumber: '+1-555-0123',
        email: 'john.smith@example.com',
        grade: '9',
        section: 'A',
        address: '123 Main St, City, State',
        bloodGroup: 'A+',
        status: 'valid',
        errors: [],
        warnings: []
      },
      {
        id: '2',
        firstName: 'Emma',
        lastName: 'Johnson',
        dateOfBirth: '2007-08-22',
        gender: 'FEMALE',
        fatherName: 'David Johnson',
        motherName: 'Sarah Johnson',
        phoneNumber: '+1-555-0124',
        email: 'emma.johnson@example.com',
        grade: '10',
        section: 'B',
        address: '456 Oak Ave, City, State',
        bloodGroup: 'B+',
        status: 'warning',
        errors: [],
        warnings: ['Phone number format might be incorrect']
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: '',
        dateOfBirth: '2008-12-10',
        gender: 'MALE',
        fatherName: 'James Wilson',
        motherName: 'Lisa Wilson',
        phoneNumber: '',
        email: 'invalid-email',
        grade: '9',
        section: 'A',
        address: '789 Pine St, City, State',
        bloodGroup: 'O+',
        status: 'error',
        errors: ['Last name is required', 'Phone number is required', 'Invalid email format'],
        warnings: []
      },
      {
        id: '4',
        firstName: 'Olivia',
        lastName: 'Brown',
        dateOfBirth: '2007-03-18',
        gender: 'FEMALE',
        fatherName: 'Thomas Brown',
        motherName: 'Jessica Brown',
        phoneNumber: '+1-555-0126',
        email: 'olivia.brown@example.com',
        grade: '10',
        section: 'A',
        address: '321 Elm St, City, State',
        bloodGroup: 'AB+',
        status: 'valid',
        errors: [],
        warnings: []
      },
      {
        id: '5',
        firstName: 'William',
        lastName: 'Davis',
        dateOfBirth: '2008-07-25',
        gender: 'MALE',
        fatherName: 'Christopher Davis',
        motherName: 'Amanda Davis',
        phoneNumber: '+1-555-0127',
        email: '',
        grade: '9',
        section: 'B',
        address: '654 Maple Ave, City, State',
        bloodGroup: 'A-',
        status: 'warning',
        errors: [],
        warnings: ['Email address is recommended but not required']
      }
    ];
    
    return {
      success: true,
      data: mockData,
      message: 'File processed successfully'
    };
  }

  // Bulk import students
  async importStudents(students: ImportedStudentData[]): Promise<AdmissionResponse> {
    await this.delay(3000);
    
    const validStudents = students.filter(s => s.status === 'valid' || s.status === 'warning');
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        successCount: validStudents.length,
        message: `Successfully imported ${validStudents.length} students!`
      };
    } else {
      return {
        success: false,
        message: 'Import failed. Please try again.'
      };
    }
  }

  // Generate sample CSV template content
  generateTemplate(): string {
    return `firstName,lastName,dateOfBirth,gender,fatherName,motherName,phoneNumber,email,grade,section,address,bloodGroup
John,Doe,2008-05-15,MALE,Robert Doe,Mary Doe,+1-555-0123,john.doe@example.com,9,A,"123 Main St, City, State",A+
Jane,Smith,2007-08-22,FEMALE,David Smith,Sarah Smith,+1-555-0124,jane.smith@example.com,10,B,"456 Oak Ave, City, State",B+
Michael,Johnson,2008-12-10,MALE,James Johnson,Lisa Johnson,+1-555-0125,michael.johnson@example.com,9,A,"789 Pine St, City, State",O+`;
  }

  // Download template file
  downloadTemplate(): void {
    const csvContent = this.generateTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const admissionAPI = new MockAdmissionAPI();

// Mock data for form options
export const mockFormData = {
  classes: [
    { id: 'class-8a', grade: '8', section: 'A', name: 'Grade 8 Section A' },
    { id: 'class-8b', grade: '8', section: 'B', name: 'Grade 8 Section B' },
    { id: 'class-9a', grade: '9', section: 'A', name: 'Grade 9 Section A' },
    { id: 'class-9b', grade: '9', section: 'B', name: 'Grade 9 Section B' },
    { id: 'class-10a', grade: '10', section: 'A', name: 'Grade 10 Section A' },
    { id: 'class-10b', grade: '10', section: 'B', name: 'Grade 10 Section B' },
    { id: 'class-11a', grade: '11', section: 'A', name: 'Grade 11 Section A' },
    { id: 'class-11b', grade: '11', section: 'B', name: 'Grade 11 Section B' },
    { id: 'class-12a', grade: '12', section: 'A', name: 'Grade 12 Section A' },
    { id: 'class-12b', grade: '12', section: 'B', name: 'Grade 12 Section B' },
  ],
  
  grades: ['8', '9', '10', '11', '12'],
  
  sections: ['A', 'B', 'C', 'D'],
  
  bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  
  genders: [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ],
  
  guardianRelations: [
    { value: 'GRANDFATHER', label: 'Grandfather' },
    { value: 'GRANDMOTHER', label: 'Grandmother' },
    { value: 'UNCLE', label: 'Uncle' },
    { value: 'AUNT', label: 'Aunt' },
    { value: 'OTHER_RELATIVE', label: 'Other Relative' },
    { value: 'FAMILY_FRIEND', label: 'Family Friend' }
  ]
};

// Mock statistics for dashboard
export const mockAdmissionStats = {
  totalStudents: 1247,
  thisMonth: 23,
  pendingReview: 7,
  recentAdmissions: [
    { name: 'John Smith', class: 'Grade 9A', date: '2 hours ago', method: 'Single' },
    { name: 'Sarah Johnson', class: 'Grade 10B', date: '5 hours ago', method: 'Single' },
    { name: 'Bulk Import (15 students)', class: 'Grade 8A-C', date: '1 day ago', method: 'Bulk' },
    { name: 'Multiple Entry (5 students)', class: 'Grade 11A', date: '2 days ago', method: 'Multiple' },
  ]
};
