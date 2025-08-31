// Download utilities for teachers data
import { Teacher } from '@/api/types';

// Transform teacher data for download
export interface TeacherDownloadData {
  employeeId: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  subjects: string;
  classes: string;
  qualification: string;
  experience: string;
  joinDate: string;
  status: string;
}

const transformTeachersForDownload = (teachers: Teacher[]): TeacherDownloadData[] => {
  return teachers.map(teacher => ({
    employeeId: teacher.employeeId || 'N/A',
    name: `${teacher.firstName} ${teacher.lastName}`,
    email: teacher.email || 'N/A',
    phoneNumber: teacher.phoneNumber || 'N/A',
    gender: teacher.gender || 'N/A',
    subjects: teacher.subjects.map(s => s.name).join(', ') || 'None',
    classes: teacher.classes.length > 0 ? teacher.classes.join(', ') : 'None',
    qualification: teacher.qualification || 'N/A',
    experience: teacher.experience ? `${teacher.experience} years` : 'N/A',
    joinDate: teacher.joiningDate || 'N/A',
    status: teacher.isActive ? 'Active' : 'Inactive'
  }));
};

// Generate CSV content
const generateCSV = (teachers: Teacher[]): string => {
  const transformedData = transformTeachersForDownload(teachers);
  
  const headers = [
    'Employee ID',
    'Teacher Name',
    'Email',
    'Phone Number',
    'Gender',
    'Subjects',
    'Classes',
    'Qualification',
    'Experience',
    'Join Date',
    'Status'
  ];

  const csvRows = [
    headers.join(','),
    ...transformedData.map(teacher => [
      teacher.employeeId,
      `"${teacher.name}"`,
      teacher.email,
      teacher.phoneNumber,
      teacher.gender,
      `"${teacher.subjects}"`,
      `"${teacher.classes}"`,
      `"${teacher.qualification}"`,
      teacher.experience,
      teacher.joinDate,
      teacher.status
    ].join(','))
  ];

  return csvRows.join('\n');
};

// Download as Excel (CSV format)
export const downloadTeachersExcel = (teachers: Teacher[], filename: string = 'teachers') => {
  const csvContent = generateCSV(teachers);
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
export const downloadTeachersPDF = (teachers: Teacher[], filename: string = 'teachers') => {
  const transformedData = transformTeachersForDownload(teachers);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Teachers List</title>
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
        .status {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 8px;
          font-weight: bold;
        }
        .status.Active { background-color: #dcfce7; color: #166534; }
        .status.Inactive { background-color: #fecaca; color: #991b1b; }
        
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
        <h1>Teachers List Report</h1>
      </div>
      
      <div class="school-info">
        <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>Total Teachers:</strong> ${transformedData.length}</p>
        <p><strong>Active Teachers:</strong> ${transformedData.filter(t => t.status === 'Active').length}</p>
      </div>

      ${transformedData.length > 0 ? `
      <div class="filters-info">
        <strong>Report Details:</strong> 
        Total Subjects Covered: ${[...new Set(transformedData.flatMap(t => t.subjects.split(', ')))].filter(s => s !== 'None').length} | 
        Departments: ${[...new Set(transformedData.map(t => t.subjects.split(', ')[0]))].filter(s => s !== 'None').length}
      </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">Employee ID</th>
            <th style="width: 15%;">Teacher Name</th>
            <th style="width: 15%;">Email</th>
            <th style="width: 8%;">Phone</th>
            <th style="width: 6%;">Gender</th>
            <th style="width: 15%;">Subjects</th>
            <th style="width: 10%;">Classes</th>
            <th style="width: 10%;">Qualification</th>
            <th style="width: 8%;">Experience</th>
            <th style="width: 8%;">Join Date</th>
            <th style="width: 7%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${transformedData.map((teacher, index) => `
            <tr>
              <td>${teacher.employeeId}</td>
              <td><strong>${teacher.name}</strong></td>
              <td>${teacher.email}</td>
              <td>${teacher.phoneNumber}</td>
              <td>${teacher.gender}</td>
              <td>${teacher.subjects}</td>
              <td>${teacher.classes}</td>
              <td>${teacher.qualification}</td>
              <td>${teacher.experience}</td>
              <td>${teacher.joinDate}</td>
              <td><span class="status ${teacher.status}">${teacher.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-left">
          <p><strong>Summary:</strong></p>
          <p>Total Records: ${transformedData.length}</p>
          <p>Active: ${transformedData.filter(t => t.status === 'Active').length}, Inactive: ${transformedData.filter(t => t.status === 'Inactive').length}</p>
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

// Main download function
export const downloadTeachers = (
  teachers: Teacher[], 
  format: 'excel' | 'pdf', 
  filename: string = 'teachers'
) => {
  if (format === 'excel') {
    downloadTeachersExcel(teachers, filename);
  } else {
    downloadTeachersPDF(teachers, filename);
  }
};
