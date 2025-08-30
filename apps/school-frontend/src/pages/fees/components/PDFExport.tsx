// PDF Export functionality for Fee Management

import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Eye, 
  Calendar,
  GraduationCap,
  DollarSign,
  Users,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PDFExportOptions {
  reportType: 'fee_summary' | 'payment_history' | 'outstanding_fees' | 'collection_report';
  dateRange: {
    from: string;
    to: string;
  };
  filters: {
    class?: string;
    section?: string;
    feeStatus?: string;
  };
  includeCharts: boolean;
  includeStudentDetails: boolean;
  customTitle?: string;
  customHeader?: string;
}

interface PDFExportProps {
  onExport?: (options: PDFExportOptions) => void;
}

export const PDFExport: React.FC<PDFExportProps> = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [options, setOptions] = useState<PDFExportOptions>({
    reportType: 'fee_summary',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    filters: {},
    includeCharts: true,
    includeStudentDetails: true
  });

  const reportTypes = [
    {
      value: 'fee_summary',
      label: 'Fee Summary Report',
      description: 'Overall fees collection and pending amounts by class/section',
      icon: DollarSign
    },
    {
      value: 'payment_history',
      label: 'Payment History Report',
      description: 'Detailed payment transactions and receipts',
      icon: FileText
    },
    {
      value: 'outstanding_fees',
      label: 'Outstanding Fees Report',
      description: 'Students with pending or overdue payments',
      icon: Calendar
    },
    {
      value: 'collection_report',
      label: 'Collection Analysis Report',
      description: 'Revenue analysis and collection trends',
      icon: Users
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Mock PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock PDF blob
      const pdfContent = generateMockPDF(options);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `${options.reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF report exported successfully!');
      if (onExport) {
        onExport(options);
      }
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const generateMockPDF = (options: PDFExportOptions): string => {
    // Mock PDF content generation
    const reportData = {
      title: options.customTitle || reportTypes.find(r => r.value === options.reportType)?.label || 'Fee Report',
      generatedOn: new Date().toLocaleString('en-IN'),
      dateRange: `${new Date(options.dateRange.from).toLocaleDateString('en-IN')} - ${new Date(options.dateRange.to).toLocaleDateString('en-IN')}`,
      schoolName: 'Vidyalaya One School',
      academicYear: '2024-25'
    };

    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 750 Td
(${reportData.title}) Tj
0 -30 Td
/F1 12 Tf
(${reportData.schoolName}) Tj
0 -20 Td
(Academic Year: ${reportData.academicYear}) Tj
0 -20 Td
(Report Period: ${reportData.dateRange}) Tj
0 -20 Td
(Generated on: ${reportData.generatedOn}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000526 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
623
%%EOF`;
  };

  const handlePreview = () => {
    setPreviewMode(true);
    // In a real implementation, this would show a preview of the PDF
    toast('PDF preview would be shown here');
  };

  const updateOption = <K extends keyof PDFExportOptions>(
    key: K, 
    value: PDFExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateFilter = <K extends keyof PDFExportOptions['filters']>(
    key: K, 
    value: PDFExportOptions['filters'][K]
  ) => {
    setOptions(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const selectedReport = reportTypes.find(r => r.value === options.reportType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export PDF Report
          </DialogTitle>
          <DialogDescription>
            Configure and generate detailed fee management reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Report Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card 
                    key={report.value}
                    className={`cursor-pointer transition-all ${
                      options.reportType === report.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateOption('reportType', report.value as PDFExportOptions['reportType'])}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{report.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </div>
                        </div>
                        {options.reportType === report.value && (
                          <Badge variant="default" className="ml-auto">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={options.dateRange.from}
                onChange={(e) => updateOption('dateRange', {
                  ...options.dateRange,
                  from: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={options.dateRange.to}
                onChange={(e) => updateOption('dateRange', {
                  ...options.dateRange,
                  to: e.target.value
                })}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filters (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={options.filters.class || ''} onValueChange={(value) => updateFilter('class', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={options.filters.section || ''} onValueChange={(value) => updateFilter('section', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fee Status</Label>
                <Select value={options.filters.feeStatus || ''} onValueChange={(value) => updateFilter('feeStatus', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Report Options</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => updateOption('includeCharts', checked as boolean)}
                />
                <Label htmlFor="include-charts" className="text-sm">
                  Include charts and graphs
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-details"
                  checked={options.includeStudentDetails}
                  onCheckedChange={(checked) => updateOption('includeStudentDetails', checked as boolean)}
                />
                <Label htmlFor="include-details" className="text-sm">
                  Include detailed student information
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-title">Custom Report Title (Optional)</Label>
              <Input
                id="custom-title"
                placeholder={selectedReport?.label}
                value={options.customTitle || ''}
                onChange={(e) => updateOption('customTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-header">Custom Header Notes (Optional)</Label>
              <Textarea
                id="custom-header"
                placeholder="Add any additional notes or instructions for the report..."
                value={options.customHeader || ''}
                onChange={(e) => updateOption('customHeader', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Report Preview Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">Report Summary</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Type: {selectedReport?.label}</div>
                  <div>• Period: {new Date(options.dateRange.from).toLocaleDateString('en-IN')} to {new Date(options.dateRange.to).toLocaleDateString('en-IN')}</div>
                  <div>• Filters: {Object.values(options.filters).filter(Boolean).length > 0 ? 'Applied' : 'None'}</div>
                  <div>• Charts: {options.includeCharts ? 'Included' : 'Excluded'}</div>
                  <div>• Student Details: {options.includeStudentDetails ? 'Included' : 'Excluded'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            <Download className="h-4 w-4" />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExport;
