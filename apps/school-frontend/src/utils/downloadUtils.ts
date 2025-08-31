// Utility functions for downloading student data in various formats

// Types for download functionality
export interface DownloadStudent {
  rollNo: string;
  name: string;
  admissionNumber: string;
  class: string;
  section: string;
  academicYear: string;
  admissionDate: string;
  feeStatus: string;
  gender?: string;
  bloodGroup?: string;
  fatherName?: string;
  motherName?: string;
  phoneNumber?: string;
  email?: string;
}

// Enhanced Student type (to avoid circular imports)
export interface EnhancedStudent {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT';
  avatar: string;
  phoneNumber: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  rollNo: string;
  admissionDate: string;
  currentClass: {
    id: string;
    grade: string;
    section: string;
    className: string;
    academicYear: string;
  };
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
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email: string;
  };
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  feeStatus: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate?: string;
    status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  };
}

// Transform enhanced student data for download
export const transformStudentsForDownload = (students: EnhancedStudent[]): DownloadStudent[] => {
  return students.map(student => ({
    rollNo: student.rollNo || 'N/A',
    name: `${student.firstName} ${student.lastName}`,
    admissionNumber: student.studentId,
    class: student.currentClass.grade,
    section: student.currentClass.section,
    academicYear: student.currentClass.academicYear,
    admissionDate: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A',
    feeStatus: student.feeStatus.status,
    gender: student.gender || 'N/A',
    bloodGroup: student.bloodGroup || 'N/A',
    fatherName: student.parentGuardian.fatherName || 'N/A',
    motherName: student.parentGuardian.motherName || 'N/A',
    phoneNumber: student.phoneNumber || 'N/A',
    email: student.email || 'N/A'
  }));
};

// CSV Generation
export const generateCSV = (data: DownloadStudent[]): string => {
  const headers = [
    'Roll No',
    'Student Name',
    'Admission Number',
    'Class',
    'Section',
    'Academic Year',
    'Admission Date',
    'Fee Status',
    'Gender',
    'Blood Group',
    'Father Name',
    'Mother Name',
    'Phone Number',
    'Email'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(student => [
      student.rollNo,
      `"${student.name}"`,
      student.admissionNumber,
      student.class,
      student.section,
      student.academicYear,
      student.admissionDate,
      student.feeStatus,
      student.gender,
      student.bloodGroup,
      `"${student.fatherName}"`,
      `"${student.motherName}"`,
      student.phoneNumber,
      student.email
    ].join(','))
  ].join('\n');

  return csvContent;
};

// Excel Generation (using CSV format with .xlsx extension)
export const downloadExcel = (students: EnhancedStudent[], filename: string = 'students') => {
  const transformedData = transformStudentsForDownload(students);
  const csvContent = generateCSV(transformedData);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Simple PDF Generation using HTML content
export const downloadPDF = (students: EnhancedStudent[], filename: string = 'students') => {
  const transformedData = transformStudentsForDownload(students);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Students List</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .school-info {
          text-align: center;
          margin-bottom: 25px;
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
        }
        .school-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .filters-info {
          background-color: #eff6ff;
          padding: 10px;
          border-left: 4px solid #2563eb;
          margin-bottom: 20px;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px 4px;
          text-align: left;
        }
        th {
          background-color: #2563eb;
          color: white;
          font-weight: bold;
          font-size: 9px;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        tr:hover {
          background-color: #e2e8f0;
        }
        .summary {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f1f5f9;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-left {
          font-size: 12px;
        }
        .summary-right {
          text-align: right;
          font-size: 12px;
          font-weight: bold;
        }
        .fee-status {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 8px;
          font-weight: bold;
        }
        .fee-status.PAID { background-color: #dcfce7; color: #166534; }
        .fee-status.PENDING { background-color: #fef3c7; color: #92400e; }
        .fee-status.PARTIAL { background-color: #fde68a; color: #92400e; }
        .fee-status.OVERDUE { background-color: #fecaca; color: #991b1b; }
        
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          table { font-size: 8px; }
          th, td { padding: 4px 2px; }
        }
        
        @page {
          margin: 1cm;
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Students List Report</h1>
      </div>
      
      <div class="school-info">
        <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>Total Students:</strong> ${transformedData.length}</p>
        <p><strong>Academic Year:</strong> ${transformedData.length > 0 ? transformedData[0].academicYear : 'N/A'}</p>
      </div>

      ${transformedData.length > 0 ? `
      <div class="filters-info">
        <strong>Report Details:</strong> 
        Classes: ${[...new Set(transformedData.map(s => s.class))].join(', ') || 'All'} | 
        Sections: ${[...new Set(transformedData.map(s => s.section))].join(', ') || 'All'}
      </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            <th style="width: 6%;">Roll No</th>
            <th style="width: 15%;">Student Name</th>
            <th style="width: 10%;">Admission No</th>
            <th style="width: 6%;">Class</th>
            <th style="width: 6%;">Section</th>
            <th style="width: 8%;">Academic Year</th>
            <th style="width: 8%;">Admission Date</th>
            <th style="width: 7%;">Fee Status</th>
            <th style="width: 5%;">Gender</th>
            <th style="width: 6%;">Blood Group</th>
            <th style="width: 12%;">Father Name</th>
            <th style="width: 12%;">Mother Name</th>
            <th style="width: 9%;">Phone</th>
          </tr>
        </thead>
        <tbody>
          ${transformedData.map((student, index) => `
            <tr>
              <td>${student.rollNo}</td>
              <td><strong>${student.name}</strong></td>
              <td>${student.admissionNumber}</td>
              <td>${student.class}</td>
              <td>${student.section}</td>
              <td>${student.academicYear}</td>
              <td>${student.admissionDate}</td>
              <td><span class="fee-status ${student.feeStatus}">${student.feeStatus}</span></td>
              <td>${student.gender}</td>
              <td>${student.bloodGroup}</td>
              <td>${student.fatherName}</td>
              <td>${student.motherName}</td>
              <td>${student.phoneNumber}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-left">
          <p><strong>Summary:</strong></p>
          <p>Total Records: ${transformedData.length}</p>
          <p>Fee Status: ${transformedData.filter(s => s.feeStatus === 'PAID').length} Paid, ${transformedData.filter(s => s.feeStatus === 'PENDING').length} Pending</p>
        </div>
        <div class="summary-right">
          <p>Report Generated: ${new Date().toLocaleString()}</p>
          <p>System: School Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      // Close window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  } else {
    // Fallback: create downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
};

// Main download function that handles both formats
export const downloadStudents = (
  students: EnhancedStudent[], 
  format: 'excel' | 'pdf',
  filename: string = 'students'
) => {
  if (students.length === 0) {
    throw new Error('No students data to download');
  }

  switch (format) {
    case 'excel':
      downloadExcel(students, filename);
      break;
    case 'pdf':
      downloadPDF(students, filename);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
