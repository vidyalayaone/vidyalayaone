// Classes management page for admin users

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen,
  ChevronDown,
  UserCheck,
  Loader2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useClassesStore } from '@/store/classesStore';

// Types for class data
export interface ClassSection {
  id: string;
  name: string;
  classTeacher: string | null;
  classTeacherId: string | null;
  totalStudents: number | null;
  totalBoys: number | null;
  totalGirls: number | null;
}

export interface SchoolClass {
  id: string;
  grade: string;
  displayName: string;
  sections: ClassSection[];
}

// Backend API response types
interface BackendSection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendClass {
  id: string;
  name: string;
  sections: BackendSection[];
  createdAt: string;
  updatedAt: string;
}

interface BackendApiResponse {
  school: {
    id: string;
    name: string;
  };
  academicYear: string;
  classes: BackendClass[];
  totalClasses: number;
  totalSections: number;
  totalStudents?: number; // Optional - will be added later
  totalBoys?: number;     // Optional - will be added later
  totalGirls?: number;    // Optional - will be added later
}

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025-26');

  // Use shared classes store
  const classes = useClassesStore(state => state.classes);
  const isLoading = useClassesStore(state => state.isLoading);
  const error = useClassesStore(state => state.error);
  const fetchClassesAndSections = useClassesStore(state => state.fetchClassesAndSections);

  const { school } = useAuthStore();

  // Fetch classes and sections from the shared store
  useEffect(() => {
    const run = async () => {
      if (!school?.id) return;
      await fetchClassesAndSections(school.id, selectedAcademicYear);
    };

    run();
  }, [school?.id, selectedAcademicYear, fetchClassesAndSections]);

  // Handle class click
  const handleClassClick = (schoolClass: SchoolClass) => {
    if (schoolClass.sections.length === 1) {
      // Single section - go directly to section page
      const section = schoolClass.sections[0];
      navigate(`/classes/${schoolClass.id}/${section.id}`);
    }
    // If multiple sections, the dropdown will handle navigation
  };

  // Handle section click
  const handleSectionClick = (schoolClass: SchoolClass, section: ClassSection) => {
    navigate(`/classes/${schoolClass.id}/${section.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
            {/* <p className="text-muted-foreground">
              Manage school classes and sections
            </p> */}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading classes...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your classes and sections.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading classes</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content - only show when not loading and no error */}
        {!isLoading && !error && (
          <>
            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {classes.map((schoolClass) => (
                <Card key={schoolClass.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{schoolClass.displayName}</h3>
                        <Badge variant="secondary">
                          {schoolClass.sections.length} Section{schoolClass.sections.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {/* <div className="text-sm text-muted-foreground">
                        Total Students: {schoolClass.sections.reduce((sum, section) => sum + (section.totalStudents || 0), 0) || 'N/A'}
                      </div> */}

                      {schoolClass.sections.length === 1 ? (
                        <Button 
                          className="w-full" 
                          onClick={() => handleClassClick(schoolClass)}
                        >
                          View Class
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="w-full">
                              Select Section
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[200px]">
                            {schoolClass.sections.map((section) => (
                              <DropdownMenuItem
                                key={section.id}
                                onClick={() => handleSectionClick(schoolClass, section)}
                              >
                                <div className="flex flex-col w-full">
                                  <div className="font-medium">{section.name}</div>
                                  {/* <div className="text-sm text-muted-foreground">
                                    {section.totalStudents || 'N/A'} students • {section.classTeacher || 'No teacher assigned'}
                                  </div> */}
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {classes.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data found</h3>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;