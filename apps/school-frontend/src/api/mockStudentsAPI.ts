// Mock Students API to provide consistent student data across components

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  admissionDate: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  avatar: string;
  parentGuardian: {
    fatherName: string;
    fatherPhone: string;
    fatherEmail: string;
    fatherOccupation: string;
    motherName: string;
    motherPhone: string;
    motherEmail: string;
    motherOccupation: string;
  };
  transport: {
    route: string;
    pickup: string;
  };
  documents: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  fees: {
    structure: string;
    nextDue: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    history: Array<{
      date: string;
      amount: number;
      status: string;
      method: string;
    }>;
  };
  activity: Array<{
    date: string;
    event: string;
  }>;
}

// Mock student data - matches the StudentFeeSummary IDs from mockFeesAPI
const mockStudents: Record<string, Student> = {
  'STU001': {
    id: "STU001",
    rollNo: "01",
    name: "Rahul Sharma",
    class: "10",
    section: "A",
    admissionDate: "2023-04-10",
    email: "rahul.sharma@example.com",
    phone: "+91-9876543001",
    address: "123 MG Road, Mumbai, Maharashtra",
    status: "Active",
    feeStatus: "Paid",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Rajesh Sharma',
      fatherPhone: '+91-9876540001',
      fatherEmail: 'rajesh.sharma@example.com',
      fatherOccupation: 'Business Owner',
      motherName: 'Priya Sharma',
      motherPhone: '+91-9876540002',
      motherEmail: 'priya.sharma@example.com',
      motherOccupation: 'Teacher'
    },
    transport: { route: 'Bus Route 1', pickup: 'MG Road Junction' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" },
      { id: 3, name: "Address Proof", url: "#" },
      { id: 4, name: "Aadhar Card", url: "#" }
    ],
    fees: {
      structure: "Annual: 45,000 INR",
      nextDue: "2025-04-10",
      totalAmount: 45000,
      paidAmount: 45000,
      pendingAmount: 0,
      history: [
        { date: "2024-04-10", amount: 15000, status: "Paid", method: "Online" },
        { date: "2024-08-10", amount: 15000, status: "Paid", method: "UPI" },
        { date: "2024-12-10", amount: 15000, status: "Paid", method: "Bank Transfer" }
      ]
    },
    activity: [
      { date: "2024-12-10", event: "Final installment paid" },
      { date: "2024-11-15", event: "Term exam completed" },
      { date: "2024-10-20", event: "Parent-teacher meeting attended" }
    ]
  },

  'STU002': {
    id: "STU002",
    rollNo: "15",
    name: "Priya Patel",
    class: "12",
    section: "B",
    admissionDate: "2021-04-15",
    email: "priya.patel@example.com",
    phone: "+91-9876543002",
    address: "456 SG Highway, Ahmedabad, Gujarat",
    status: "Active",
    feeStatus: "Partial",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Kiran Patel',
      fatherPhone: '+91-9876540003',
      fatherEmail: 'kiran.patel@example.com',
      fatherOccupation: 'Engineer',
      motherName: 'Meera Patel',
      motherPhone: '+91-9876540004',
      motherEmail: 'meera.patel@example.com',
      motherOccupation: 'Doctor'
    },
    transport: { route: 'Bus Route 3', pickup: 'SG Highway Metro' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" },
      { id: 3, name: "Address Proof", url: "#" },
      { id: 4, name: "Merit Certificate", url: "#" }
    ],
    fees: {
      structure: "Annual: 50,000 INR",
      nextDue: "2025-01-15",
      totalAmount: 50000,
      paidAmount: 30000,
      pendingAmount: 20000,
      history: [
        { date: "2024-04-15", amount: 15000, status: "Paid", method: "Cheque" },
        { date: "2024-08-15", amount: 15000, status: "Paid", method: "Online" }
      ]
    },
    activity: [
      { date: "2024-08-15", event: "Second installment paid" },
      { date: "2024-07-20", event: "Board exam form submitted" },
      { date: "2024-06-10", event: "Science project submitted" }
    ]
  },

  'STU003': {
    id: "STU003",
    rollNo: "08",
    name: "Arjun Singh",
    class: "11",
    section: "A",
    admissionDate: "2022-04-20",
    email: "arjun.singh@example.com",
    phone: "+91-9876543003",
    address: "789 Civil Lines, Delhi",
    status: "Active",
    feeStatus: "Pending",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Vikram Singh',
      fatherPhone: '+91-9876540005',
      fatherEmail: 'vikram.singh@example.com',
      fatherOccupation: 'Government Officer',
      motherName: 'Sunita Singh',
      motherPhone: '+91-9876540006',
      motherEmail: 'sunita.singh@example.com',
      motherOccupation: 'Professor'
    },
    transport: { route: 'Bus Route 2', pickup: 'Civil Lines Metro' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" },
      { id: 3, name: "Address Proof", url: "#" }
    ],
    fees: {
      structure: "Annual: 48,000 INR",
      nextDue: "2024-12-20",
      totalAmount: 48000,
      paidAmount: 16000,
      pendingAmount: 32000,
      history: [
        { date: "2024-04-20", amount: 16000, status: "Paid", method: "Cash" }
      ]
    },
    activity: [
      { date: "2024-04-20", event: "First installment paid" },
      { date: "2024-04-15", event: "Stream selection completed" },
      { date: "2024-04-10", event: "New academic year started" }
    ]
  },

  'STU004': {
    id: "STU004",
    rollNo: "22",
    name: "Sneha Reddy",
    class: "10",
    section: "C",
    admissionDate: "2023-04-25",
    email: "sneha.reddy@example.com",
    phone: "+91-9876543004",
    address: "321 Banjara Hills, Hyderabad, Telangana",
    status: "Active",
    feeStatus: "Overdue",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Ravi Reddy',
      fatherPhone: '+91-9876540007',
      fatherEmail: 'ravi.reddy@example.com',
      fatherOccupation: 'Software Engineer',
      motherName: 'Lakshmi Reddy',
      motherPhone: '+91-9876540008',
      motherEmail: 'lakshmi.reddy@example.com',
      motherOccupation: 'Nurse'
    },
    transport: { route: 'Bus Route 4', pickup: 'Banjara Hills Junction' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" }
    ],
    fees: {
      structure: "Annual: 46,000 INR",
      nextDue: "2024-08-25",
      totalAmount: 46000,
      paidAmount: 0,
      pendingAmount: 46000,
      history: []
    },
    activity: [
      { date: "2024-04-25", event: "Admission completed" },
      { date: "2024-04-20", event: "Document verification done" },
      { date: "2024-04-15", event: "Application submitted" }
    ]
  },

  'STU005': {
    id: "STU005",
    rollNo: "35",
    name: "Aditya Kumar",
    class: "12",
    section: "A",
    admissionDate: "2021-04-30",
    email: "aditya.kumar@example.com",
    phone: "+91-9876543005",
    address: "654 Park Street, Kolkata, West Bengal",
    status: "Active",
    feeStatus: "Partial",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Manoj Kumar',
      fatherPhone: '+91-9876540009',
      fatherEmail: 'manoj.kumar@example.com',
      fatherOccupation: 'Bank Manager',
      motherName: 'Kavita Kumar',
      motherPhone: '+91-9876540010',
      motherEmail: 'kavita.kumar@example.com',
      motherOccupation: 'Homemaker'
    },
    transport: { route: 'Bus Route 5', pickup: 'Park Street Metro' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" },
      { id: 3, name: "Address Proof", url: "#" },
      { id: 4, name: "Sports Certificate", url: "#" }
    ],
    fees: {
      structure: "Annual: 52,000 INR",
      nextDue: "2025-01-30",
      totalAmount: 52000,
      paidAmount: 26000,
      pendingAmount: 26000,
      history: [
        { date: "2024-04-30", amount: 13000, status: "Paid", method: "Online" },
        { date: "2024-08-30", amount: 13000, status: "Paid", method: "UPI" }
      ]
    },
    activity: [
      { date: "2024-08-30", event: "Second installment paid" },
      { date: "2024-07-15", event: "Sports day participation" },
      { date: "2024-06-20", event: "Science fair winner" }
    ]
  },

  // Default fallback student (matches original STU123)
  'STU123': {
    id: "STU123",
    rollNo: "23",
    name: "John Doe",
    class: "6",
    section: "A",
    admissionDate: "2022-04-10",
    email: "john@example.com",
    phone: "+91-9876543210",
    address: "123 Main Street, City",
    status: "Active",
    feeStatus: "Pending",
    avatar: "/placeholder.svg",
    parentGuardian: {
      fatherName: 'Mike Doe',
      fatherPhone: '+91-9876500001',
      fatherEmail: 'mike.doe@example.com',
      fatherOccupation: 'Engineer',
      motherName: 'Jane Doe',
      motherPhone: '+91-9876500000',
      motherEmail: 'jane.doe@example.com',
      motherOccupation: 'Teacher'
    },
    transport: { route: 'Bus 5', pickup: 'Station Road' },
    documents: [
      { id: 1, name: "Birth Certificate", url: "#" },
      { id: 2, name: "Previous School TC", url: "#" },
      { id: 3, name: "Address Proof", url: "#" }
    ],
    fees: {
      structure: "Annual: 40,000 INR",
      nextDue: "2025-09-10",
      totalAmount: 40000,
      paidAmount: 30000,
      pendingAmount: 10000,
      history: [
        { date: "2025-04-10", amount: 10000, status: "Paid", method: "Online" },
        { date: "2025-06-10", amount: 10000, status: "Paid", method: "Cash" },
        { date: "2025-08-10", amount: 10000, status: "Paid", method: "Bank Transfer" }
      ]
    },
    activity: [
      { date: "2025-08-10", event: "Fee paid" },
      { date: "2025-08-15", event: "Document uploaded" },
      { date: "2025-08-18", event: "Attendance marked" }
    ]
  }
};

// API class to simulate student data fetching
class StudentsAPI {
  private delay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getStudentById(studentId: string): Promise<Student | null> {
    await this.delay();
    return mockStudents[studentId] || null;
  }

  async getAllStudents(): Promise<Student[]> {
    await this.delay();
    return Object.values(mockStudents);
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    await this.delay();
    return Object.values(mockStudents).filter(student => student.class === className);
  }

  async searchStudents(query: string): Promise<Student[]> {
    await this.delay();
    const lowercaseQuery = query.toLowerCase();
    return Object.values(mockStudents).filter(student => 
      student.name.toLowerCase().includes(lowercaseQuery) ||
      student.id.toLowerCase().includes(lowercaseQuery) ||
      student.rollNo.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const studentsAPI = new StudentsAPI();
export { mockStudents };
