// Bulk import admission page

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { admissionAPI, type ImportedStudentData } from '@/api/mockAdmissionAPI';

interface ImportedStudent extends ImportedStudentData {}

interface ImportSummary {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

const BulkImportAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'complete'>('upload');

  const handleBack = () => {
    navigate('/admission');
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const result = await admissionAPI.validateImportFile(selectedFile);
      
      if (result.success && result.data) {
        setImportedData(result.data);
        setCurrentStep('review');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const downloadTemplate = () => {
    admissionAPI.downloadTemplate();
    toast.success('Template downloaded successfully!');
  };

  const getSummary = (): ImportSummary => {
    return {
      total: importedData.length,
      valid: importedData.filter(s => s.status === 'valid').length,
      warnings: importedData.filter(s => s.status === 'warning').length,
      errors: importedData.filter(s => s.status === 'error').length,
    };
  };

  const handleImport = async () => {
    const validStudents = importedData.filter(s => s.status === 'valid' || s.status === 'warning');
    
    if (validStudents.length === 0) {
      toast.error('No valid students to import. Please fix the errors first.');
      return;
    }

    setIsImporting(true);

    try {
      const result = await admissionAPI.importStudents(validStudents);
      
      if (result.success) {
        toast.success(result.message);
        setCurrentStep('complete');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const removeStudent = (id: string) => {
    setImportedData(prev => prev.filter(student => student.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const summary = getSummary();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admission
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Bulk Import Admission</h1>
              <p className="text-muted-foreground">
                Import student data from Excel or CSV files
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-primary' : currentStep === 'review' || currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-primary text-primary-foreground' : currentStep === 'review' || currentStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                  {currentStep === 'review' || currentStep === 'complete' ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className="font-medium">Upload File</span>
              </div>
              
              <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-primary' : currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-primary text-primary-foreground' : currentStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                  {currentStep === 'complete' ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="font-medium">Review & Validate</span>
              </div>
              
              <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                  {currentStep === 'complete' ? <CheckCircle className="w-4 h-4" /> : '3'}
                </div>
                <span className="font-medium">Import Complete</span>
              </div>
            </div>
            
            <Progress value={currentStep === 'upload' ? 33 : currentStep === 'review' ? 66 : 100} className="w-full" />
          </CardContent>
        </Card>

        <Tabs value={currentStep} className="w-full">
          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="space-y-6">
              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>File Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Supported Formats</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel files (.xlsx, .xls)
                        </li>
                        <li className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          CSV files (.csv)
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Required Columns</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• firstName, lastName</li>
                        <li>• dateOfBirth (YYYY-MM-DD)</li>
                        <li>• gender (MALE/FEMALE/OTHER)</li>
                        <li>• fatherName, motherName</li>
                        <li>• phoneNumber, grade, section</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse and select a file
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isProcessing}
                    />
                    <label htmlFor="file-upload">
                      <Button asChild disabled={isProcessing}>
                        <span className="cursor-pointer">
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                  
                  {file && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review">
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                        <p className="text-2xl font-bold">{summary.total}</p>
                      </div>
                      <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valid</p>
                        <p className="text-2xl font-bold text-green-600">{summary.valid}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                        <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Errors</p>
                        <p className="text-2xl font-bold text-red-600">{summary.errors}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Alerts */}
              {summary.errors > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors Found</AlertTitle>
                  <AlertDescription>
                    {summary.errors} record(s) have errors that must be fixed before importing. 
                    Please review and correct the issues below.
                  </AlertDescription>
                </Alert>
              )}

              {summary.warnings > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warnings Detected</AlertTitle>
                  <AlertDescription>
                    {summary.warnings} record(s) have warnings. These records can still be imported 
                    but you may want to review them first.
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Data Preview</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep('upload')}
                      >
                        Upload Different File
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={isImporting || summary.valid + summary.warnings === 0}
                        className="flex items-center gap-2"
                      >
                        {isImporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Import {summary.valid + summary.warnings} Students
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Parents</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Issues</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importedData.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{student.firstName} {student.lastName}</p>
                                {student.email && (
                                  <p className="text-sm text-muted-foreground">{student.email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{student.dateOfBirth}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.gender}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>F: {student.fatherName}</p>
                                <p>M: {student.motherName}</p>
                              </div>
                            </TableCell>
                            <TableCell>{student.phoneNumber}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                Grade {student.grade}-{student.section}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {student.errors.map((error, index) => (
                                  <div key={index} className="flex items-center gap-1 text-xs text-red-600">
                                    <XCircle className="w-3 h-3" />
                                    {error}
                                  </div>
                                ))}
                                {student.warnings.map((warning, index) => (
                                  <div key={index} className="flex items-center gap-1 text-xs text-yellow-600">
                                    <AlertTriangle className="w-3 h-3" />
                                    {warning}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(student.id)}
                                title="Remove from import"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Complete Tab */}
          <TabsContent value="complete">
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Import Completed Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  All valid student records have been imported into the system.
                </p>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/students')}>
                    View Students
                  </Button>
                  <Button onClick={() => navigate('/admission')}>
                    Back to Admission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BulkImportAdmissionPage;
