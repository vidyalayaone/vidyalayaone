// Mock API for fees management

export interface StudentFeeSummary {
  studentId: string;
  name: string;
  class: string;
  section: string;
  feeStatus: 'PAID' | 'PENDING' | 'PARTIALLY_PAID' | 'OVERDUE';
  lastPaymentDate?: string;
  balanceDue: number;
  totalFee: number;
  paidAmount: number;
  academicYear: string;
}

export interface FeeTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  mode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';
  proofUrl?: string;
  receiptNumber?: string;
}

export interface FeeInstallment {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
  paidAmount?: number;
}

export interface FeeConcession {
  id: string;
  type: 'SCHOLARSHIP' | 'WAIVER' | 'DISCOUNT';
  description: string;
  amount: number;
  percentage?: number;
  validFrom: string;
  validTo: string;
}

export interface FeeAuditLog {
  id: string;
  studentId?: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

export interface StudentFeeDetail {
  studentId: string;
  name: string;
  class: string;
  section: string;
  academicYear: string;
  totalFee: number;
  paidAmount: number;
  balanceDue: number;
  feeStatus: 'PAID' | 'PENDING' | 'PARTIALLY_PAID' | 'OVERDUE';
  transactions: FeeTransaction[];
  installments: FeeInstallment[];
  concessions: FeeConcession[];
  auditTrail: FeeAuditLog[];
}

export interface FeesStats {
  totalCollected: number;
  pendingFees: number;
  totalStudents: number;
  totalFeeAmount: number;
  paidStudents: number;
  pendingStudents: number;
  partiallyPaidStudents: number;
  overdueStudents: number;
  collectionByClass: { [key: string]: number };
}

// Mock data
const mockFeeSummaries: StudentFeeSummary[] = [
  {
    studentId: 'STU001',
    name: 'Rahul Sharma',
    class: '10',
    section: 'A',
    feeStatus: 'PAID',
    lastPaymentDate: '2024-12-10',
    balanceDue: 0,
    totalFee: 45000,
    paidAmount: 45000,
    academicYear: '2024-25'
  },
  {
    studentId: 'STU002',
    name: 'Priya Patel',
    class: '12',
    section: 'B',
    feeStatus: 'PARTIALLY_PAID',
    lastPaymentDate: '2024-08-15',
    balanceDue: 20000,
    totalFee: 50000,
    paidAmount: 30000,
    academicYear: '2024-25'
  },
  {
    studentId: 'STU003',
    name: 'Arjun Singh',
    class: '11',
    section: 'A',
    feeStatus: 'PENDING',
    lastPaymentDate: '2024-04-20',
    balanceDue: 32000,
    totalFee: 48000,
    paidAmount: 16000,
    academicYear: '2024-25'
  },
  {
    studentId: 'STU004',
    name: 'Sneha Reddy',
    class: '10',
    section: 'C',
    feeStatus: 'OVERDUE',
    balanceDue: 46000,
    totalFee: 46000,
    paidAmount: 0,
    academicYear: '2024-25'
  },
  {
    studentId: 'STU005',
    name: 'Aditya Kumar',
    class: '12',
    section: 'A',
    feeStatus: 'PARTIALLY_PAID',
    lastPaymentDate: '2024-08-30',
    balanceDue: 26000,
    totalFee: 52000,
    paidAmount: 26000,
    academicYear: '2024-25'
  },
];

const mockFeeDetails: { [key: string]: StudentFeeDetail } = {
  STU001: {
    studentId: 'STU001',
    name: 'Rahul Sharma',
    class: '10',
    section: 'A',
    academicYear: '2024-25',
    totalFee: 45000,
    paidAmount: 45000,
    balanceDue: 0,
    feeStatus: 'PAID',
    transactions: [
      {
        id: 'TXN001',
        date: '2024-04-15',
        description: 'Admission Fee',
        amount: 15000,
        status: 'COMPLETED',
        mode: 'BANK_TRANSFER',
        proofUrl: '/receipts/txn001.pdf',
        receiptNumber: 'REC-2024-001'
      },
      {
        id: 'TXN002',
        date: '2024-06-20',
        description: 'Quarterly Fee - Q1',
        amount: 15000,
        status: 'COMPLETED',
        mode: 'ONLINE',
        proofUrl: '/receipts/txn002.pdf',
        receiptNumber: 'REC-2024-002'
      },
      {
        id: 'TXN003',
        date: '2024-12-10',
        description: 'Quarterly Fee - Q3',
        amount: 15000,
        status: 'COMPLETED',
        mode: 'UPI',
        proofUrl: '/receipts/txn003.pdf',
        receiptNumber: 'REC-2024-003'
      }
    ],
    installments: [
      {
        id: 'INS001',
        name: 'Admission Fee',
        dueDate: '2024-04-30',
        amount: 15000,
        status: 'PAID',
        paidDate: '2024-04-15',
        paidAmount: 15000
      },
      {
        id: 'INS002',
        name: 'Quarterly Fee - Q1',
        dueDate: '2024-06-30',
        amount: 15000,
        status: 'PAID',
        paidDate: '2024-06-20',
        paidAmount: 15000
      },
      {
        id: 'INS003',
        name: 'Quarterly Fee - Q2',
        dueDate: '2024-09-30',
        amount: 15000,
        status: 'PAID',
        paidDate: '2024-08-15',
        paidAmount: 15000
      }
    ],
    concessions: [],
    auditTrail: [
      {
        id: 'AUD001',
        studentId: 'STU001',
        action: 'PAYMENT_RECEIVED',
        description: 'Payment received for Admission Fee',
        performedBy: 'Admin User',
        timestamp: '2024-04-15T10:30:00Z'
      },
      {
        id: 'AUD002',
        studentId: 'STU001',
        action: 'PAYMENT_RECEIVED',
        description: 'Payment received for Quarterly Fee - Q1',
        performedBy: 'Finance Team',
        timestamp: '2024-06-20T14:20:00Z'
      }
    ]
  },
  STU002: {
    studentId: 'STU002',
    name: 'Priya Patel',
    class: '10',
    section: 'B',
    academicYear: '2024-25',
    totalFee: 45000,
    paidAmount: 30000,
    balanceDue: 15000,
    feeStatus: 'PARTIALLY_PAID',
    transactions: [
      {
        id: 'TXN004',
        date: '2024-04-20',
        description: 'Admission Fee',
        amount: 15000,
        status: 'COMPLETED',
        mode: 'CASH',
        receiptNumber: 'REC-2024-004'
      },
      {
        id: 'TXN005',
        date: '2024-07-20',
        description: 'Quarterly Fee - Q1',
        amount: 15000,
        status: 'COMPLETED',
        mode: 'CHEQUE',
        receiptNumber: 'REC-2024-005'
      }
    ],
    installments: [
      {
        id: 'INS004',
        name: 'Admission Fee',
        dueDate: '2024-04-30',
        amount: 15000,
        status: 'PAID',
        paidDate: '2024-04-20',
        paidAmount: 15000
      },
      {
        id: 'INS005',
        name: 'Quarterly Fee - Q1',
        dueDate: '2024-06-30',
        amount: 15000,
        status: 'PAID',
        paidDate: '2024-07-20',
        paidAmount: 15000
      },
      {
        id: 'INS006',
        name: 'Quarterly Fee - Q2',
        dueDate: '2024-09-30',
        amount: 15000,
        status: 'PENDING'
      }
    ],
    concessions: [
      {
        id: 'CON001',
        type: 'SCHOLARSHIP',
        description: 'Merit Scholarship - 10%',
        amount: 4500,
        percentage: 10,
        validFrom: '2024-04-01',
        validTo: '2025-03-31'
      }
    ],
    auditTrail: [
      {
        id: 'AUD003',
        studentId: 'STU002',
        action: 'CONCESSION_APPLIED',
        description: 'Merit scholarship applied - 10%',
        performedBy: 'Principal',
        timestamp: '2024-04-01T09:00:00Z'
      }
    ]
  }
};

const mockFeesStats: FeesStats = {
  totalCollected: 75000,
  pendingFees: 105000,
  totalStudents: 5,
  totalFeeAmount: 180000,
  paidStudents: 2,
  pendingStudents: 1,
  partiallyPaidStudents: 1,
  overdueStudents: 1,
  collectionByClass: {
    '9': 0,
    '10': 75000,
    '11': 0,
    '12': 50000
  }
};

const mockGlobalAuditTrail: FeeAuditLog[] = [
  {
    id: 'GAU001',
    action: 'BULK_REMINDER_SENT',
    description: 'Reminder sent to 15 students with pending fees',
    performedBy: 'Finance Team',
    timestamp: '2024-08-20T10:00:00Z'
  },
  {
    id: 'GAU002',
    action: 'FEE_STRUCTURE_UPDATED',
    description: 'Fee structure updated for Academic Year 2024-25',
    performedBy: 'Admin User',
    timestamp: '2024-03-15T14:30:00Z'
  },
  {
    id: 'GAU003',
    action: 'CONCESSION_POLICY_UPDATED',
    description: 'Scholarship policy updated with new criteria',
    performedBy: 'Principal',
    timestamp: '2024-02-28T11:15:00Z'
  }
];

class FeesAPI {
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getFeeSummaries(filter?: {
    class?: string;
    section?: string;
    feeStatus?: string;
    academicYear?: string;
    search?: string;
  }): Promise<StudentFeeSummary[]> {
    await this.delay();
    
    let filtered = [...mockFeeSummaries];
    
    if (filter) {
      if (filter.class && filter.class !== 'all') {
        filtered = filtered.filter(s => s.class === filter.class);
      }
      if (filter.section && filter.section !== 'all') {
        filtered = filtered.filter(s => s.section === filter.section);
      }
      if (filter.feeStatus && filter.feeStatus !== 'all') {
        filtered = filtered.filter(s => s.feeStatus === filter.feeStatus);
      }
      if (filter.academicYear && filter.academicYear !== 'all') {
        filtered = filtered.filter(s => s.academicYear === filter.academicYear);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(search) ||
          s.studentId.toLowerCase().includes(search)
        );
      }
    }
    
    return filtered;
  }

  async getFeesStats(): Promise<FeesStats> {
    await this.delay(500);
    return mockFeesStats;
  }

  async getStudentFeeDetail(studentId: string): Promise<StudentFeeDetail | null> {
    await this.delay();
    return mockFeeDetails[studentId] || null;
  }

  async sendBulkReminder(studentIds: string[]): Promise<{ success: boolean; message: string }> {
    await this.delay(1500);
    return {
      success: true,
      message: `Reminder sent to ${studentIds.length} students successfully`
    };
  }

  async sendStudentReminder(studentId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(800);
    return {
      success: true,
      message: 'Reminder sent to student successfully'
    };
  }

  async getGlobalAuditTrail(): Promise<FeeAuditLog[]> {
    await this.delay(800);
    return mockGlobalAuditTrail;
  }

  async getStudentAuditTrail(studentId: string): Promise<FeeAuditLog[]> {
    await this.delay(500);
    const studentDetail = mockFeeDetails[studentId];
    return studentDetail?.auditTrail || [];
  }

  async exportFeesData(format: 'excel' | 'pdf'): Promise<{ success: boolean; downloadUrl: string }> {
    await this.delay(2000);
    return {
      success: true,
      downloadUrl: `/exports/fees_report_${format}_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    };
  }
}

export const feesAPI = new FeesAPI();
