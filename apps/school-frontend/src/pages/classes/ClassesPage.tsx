// Classes management page for admin users

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  BookOpen,
  ChevronDown,
  UserCheck,
  Calendar,
  ClipboardList
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types for class data
export interface ClassSection {
  id: string;
  name: string;
  classTeacher: string;
  classTeacherId: string;
  totalStudents: number;
  totalBoys: number;
  totalGirls: number;
}

export interface SchoolClass {
  id: string;
  grade: string;
  displayName: string;
  sections: ClassSection[];
}

// Mock data for classes
const mockClasses: SchoolClass[] = [
  {
    id: 'nursery',
    grade: 'Nursery',
    displayName: 'Nursery',
    sections: [
      {
        id: 'nursery-default',
        name: 'Default',
        classTeacher: 'Mrs. Sarah Johnson',
        classTeacherId: 'teacher-1',
        totalStudents: 25,
        totalBoys: 13,
        totalGirls: 12,
      }
    ]
  },
  {
    id: 'kg1',
    grade: 'KG1',
    displayName: 'KG1',
    sections: [
      {
        id: 'kg1-default',
        name: 'Default',
        classTeacher: 'Mrs. Emily Davis',
        classTeacherId: 'teacher-2',
        totalStudents: 28,
        totalBoys: 15,
        totalGirls: 13,
      }
    ]
  },
  {
    id: 'kg2',
    grade: 'KG2',
    displayName: 'KG2',
    sections: [
      {
        id: 'kg2-default',
        name: 'Default',
        classTeacher: 'Mrs. Lisa Brown',
        classTeacherId: 'teacher-3',
        totalStudents: 30,
        totalBoys: 16,
        totalGirls: 14,
      }
    ]
  },
  {
    id: 'grade-1',
    grade: '1',
    displayName: 'Grade 1',
    sections: [
      {
        id: 'grade-1-a',
        name: 'A',
        classTeacher: 'Mrs. Rachel Green',
        classTeacherId: 'teacher-4',
        totalStudents: 32,
        totalBoys: 17,
        totalGirls: 15,
      },
      {
        id: 'grade-1-b',
        name: 'B',
        classTeacher: 'Mrs. Monica White',
        classTeacherId: 'teacher-5',
        totalStudents: 30,
        totalBoys: 15,
        totalGirls: 15,
      }
    ]
  },
  {
    id: 'grade-2',
    grade: '2',
    displayName: 'Grade 2',
    sections: [
      {
        id: 'grade-2-a',
        name: 'A',
        classTeacher: 'Mrs. Jennifer Wilson',
        classTeacherId: 'teacher-6',
        totalStudents: 35,
        totalBoys: 18,
        totalGirls: 17,
      },
      {
        id: 'grade-2-b',
        name: 'B',
        classTeacher: 'Mrs. Amanda Taylor',
        classTeacherId: 'teacher-7',
        totalStudents: 33,
        totalBoys: 16,
        totalGirls: 17,
      }
    ]
  },
  {
    id: 'grade-3',
    grade: '3',
    displayName: 'Grade 3',
    sections: [
      {
        id: 'grade-3-a',
        name: 'A',
        classTeacher: 'Mr. David Smith',
        classTeacherId: 'teacher-8',
        totalStudents: 38,
        totalBoys: 20,
        totalGirls: 18,
      },
      {
        id: 'grade-3-b',
        name: 'B',
        classTeacher: 'Mrs. Jessica Miller',
        classTeacherId: 'teacher-9',
        totalStudents: 36,
        totalBoys: 19,
        totalGirls: 17,
      },
      {
        id: 'grade-3-c',
        name: 'C',
        classTeacher: 'Mrs. Michelle Davis',
        classTeacherId: 'teacher-10',
        totalStudents: 35,
        totalBoys: 17,
        totalGirls: 18,
      }
    ]
  },
  {
    id: 'grade-4',
    grade: '4',
    displayName: 'Grade 4',
    sections: [
      {
        id: 'grade-4-a',
        name: 'A',
        classTeacher: 'Mr. Robert Johnson',
        classTeacherId: 'teacher-11',
        totalStudents: 40,
        totalBoys: 22,
        totalGirls: 18,
      },
      {
        id: 'grade-4-b',
        name: 'B',
        classTeacher: 'Mrs. Laura Anderson',
        classTeacherId: 'teacher-12',
        totalStudents: 38,
        totalBoys: 20,
        totalGirls: 18,
      }
    ]
  },
  {
    id: 'grade-5',
    grade: '5',
    displayName: 'Grade 5',
    sections: [
      {
        id: 'grade-5-a',
        name: 'A',
        classTeacher: 'Mr. Michael Brown',
        classTeacherId: 'teacher-13',
        totalStudents: 42,
        totalBoys: 23,
        totalGirls: 19,
      },
      {
        id: 'grade-5-b',
        name: 'B',
        classTeacher: 'Mrs. Sandra Wilson',
        classTeacherId: 'teacher-14',
        totalStudents: 40,
        totalBoys: 21,
        totalGirls: 19,
      },
      {
        id: 'grade-5-c',
        name: 'C',
        classTeacher: 'Mrs. Carol Martinez',
        classTeacherId: 'teacher-15',
        totalStudents: 39,
        totalBoys: 20,
        totalGirls: 19,
      }
    ]
  },
  {
    id: 'grade-6',
    grade: '6',
    displayName: 'Grade 6',
    sections: [
      {
        id: 'grade-6-a',
        name: 'A',
        classTeacher: 'Mr. James Garcia',
        classTeacherId: 'teacher-16',
        totalStudents: 45,
        totalBoys: 24,
        totalGirls: 21,
      },
      {
        id: 'grade-6-b',
        name: 'B',
        classTeacher: 'Mrs. Helen Rodriguez',
        classTeacherId: 'teacher-17',
        totalStudents: 43,
        totalBoys: 22,
        totalGirls: 21,
      }
    ]
  },
  {
    id: 'grade-7',
    grade: '7',
    displayName: 'Grade 7',
    sections: [
      {
        id: 'grade-7-a',
        name: 'A',
        classTeacher: 'Mr. Christopher Lee',
        classTeacherId: 'teacher-18',
        totalStudents: 48,
        totalBoys: 25,
        totalGirls: 23,
      },
      {
        id: 'grade-7-b',
        name: 'B',
        classTeacher: 'Mrs. Patricia Harris',
        classTeacherId: 'teacher-19',
        totalStudents: 46,
        totalBoys: 24,
        totalGirls: 22,
      }
    ]
  },
  {
    id: 'grade-8',
    grade: '8',
    displayName: 'Grade 8',
    sections: [
      {
        id: 'grade-8-a',
        name: 'A',
        classTeacher: 'Mr. Daniel Clark',
        classTeacherId: 'teacher-20',
        totalStudents: 50,
        totalBoys: 26,
        totalGirls: 24,
      },
      {
        id: 'grade-8-b',
        name: 'B',
        classTeacher: 'Mrs. Nancy Lewis',
        classTeacherId: 'teacher-21',
        totalStudents: 48,
        totalBoys: 25,
        totalGirls: 23,
      }
    ]
  },
  {
    id: 'grade-9',
    grade: '9',
    displayName: 'Grade 9',
    sections: [
      {
        id: 'grade-9-a',
        name: 'A',
        classTeacher: 'Mr. Thomas Walker',
        classTeacherId: 'teacher-22',
        totalStudents: 45,
        totalBoys: 23,
        totalGirls: 22,
      },
      {
        id: 'grade-9-b',
        name: 'B',
        classTeacher: 'Mrs. Betty Hall',
        classTeacherId: 'teacher-23',
        totalStudents: 43,
        totalBoys: 22,
        totalGirls: 21,
      }
    ]
  },
  {
    id: 'grade-10',
    grade: '10',
    displayName: 'Grade 10',
    sections: [
      {
        id: 'grade-10-a',
        name: 'A',
        classTeacher: 'Mr. Steven Allen',
        classTeacherId: 'teacher-24',
        totalStudents: 40,
        totalBoys: 21,
        totalGirls: 19,
      },
      {
        id: 'grade-10-b',
        name: 'B',
        classTeacher: 'Mrs. Dorothy Young',
        classTeacherId: 'teacher-25',
        totalStudents: 38,
        totalBoys: 19,
        totalGirls: 19,
      }
    ]
  },
  {
    id: 'grade-11',
    grade: '11',
    displayName: 'Grade 11',
    sections: [
      {
        id: 'grade-11-a',
        name: 'Science',
        classTeacher: 'Mr. Kevin Martinez',
        classTeacherId: 'teacher-26',
        totalStudents: 35,
        totalBoys: 18,
        totalGirls: 17,
      },
      {
        id: 'grade-11-b',
        name: 'Commerce',
        classTeacher: 'Mrs. Susan Thompson',
        classTeacherId: 'teacher-27',
        totalStudents: 33,
        totalBoys: 17,
        totalGirls: 16,
      },
      {
        id: 'grade-11-c',
        name: 'Humanities',
        classTeacher: 'Mrs. Henry Thompson',
        classTeacherId: 'teacher-28',
        totalStudents: 34,
        totalBoys: 17,
        totalGirls: 17,
      }
    ]
  },
  {
    id: 'grade-12',
    grade: '12',
    displayName: 'Grade 12',
    sections: [
      {
        id: 'grade-12-a',
        name: 'A',
        classTeacher: 'Mr. Anthony Wilson',
        classTeacherId: 'teacher-29',
        totalStudents: 32,
        totalBoys: 16,
        totalGirls: 16,
      },
      {
        id: 'grade-12-b',
        name: 'B',
        classTeacher: 'Mrs. Margaret Davis',
        classTeacherId: 'teacher-30',
        totalStudents: 30,
        totalBoys: 15,
        totalGirls: 15,
      },
      {
        id: 'grade-12-b',
        name: 'B',
        classTeacher: 'Mrs. Laura Davis',
        classTeacherId: 'teacher-31',
        totalStudents: 35,
        totalBoys: 18,
        totalGirls: 17,
      }
    ]
  }
];

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Filter classes based on search and grade
  const filteredClasses = useMemo(() => {
    return mockClasses.filter(schoolClass => {
      const matchesSearch = schoolClass.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           schoolClass.grade.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || schoolClass.grade === selectedGrade;
      
      return matchesSearch && matchesGrade;
    });
  }, [searchTerm, selectedGrade]);

  // Get total statistics
  const totalStats = useMemo(() => {
    const stats = filteredClasses.reduce((acc, schoolClass) => {
      schoolClass.sections.forEach(section => {
        acc.totalClasses += 1;
        acc.totalStudents += section.totalStudents;
        acc.totalBoys += section.totalBoys;
        acc.totalGirls += section.totalGirls;
      });
      return acc;
    }, { totalClasses: 0, totalStudents: 0, totalBoys: 0, totalGirls: 0 });
    
    return stats;
  }, [filteredClasses]);

  // Handle class click
  const handleClassClick = (schoolClass: SchoolClass) => {
    if (schoolClass.sections.length === 1) {
      // Single section - go directly to section page
      const section = schoolClass.sections[0];
      const sectionName = section.name.toLowerCase() === 'default' ? 'default' : section.name.toLowerCase();
      navigate(`/classes/${schoolClass.grade.toLowerCase()}/${sectionName}`);
    }
    // If multiple sections, the dropdown will handle navigation
  };

  // Handle section click
  const handleSectionClick = (schoolClass: SchoolClass, section: ClassSection) => {
    const sectionName = section.name.toLowerCase() === 'default' ? 'default' : section.name.toLowerCase();
    navigate(`/classes/${schoolClass.grade.toLowerCase()}/${sectionName}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground">
              Manage school classes and sections
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">
                Across all grades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                All enrolled students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boys</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalBoys}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.totalStudents > 0 ? Math.round((totalStats.totalBoys / totalStats.totalStudents) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Girls</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalGirls}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.totalStudents > 0 ? Math.round((totalStats.totalGirls / totalStats.totalStudents) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="KG1">KG1</SelectItem>
                  <SelectItem value="KG2">KG2</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredClasses.map((schoolClass) => (
            <Card key={schoolClass.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{schoolClass.displayName}</h3>
                    <Badge variant="secondary">
                      {schoolClass.sections.length} Section{schoolClass.sections.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total Students: {schoolClass.sections.reduce((sum, section) => sum + section.totalStudents, 0)}
                  </div>

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
                              <div className="font-medium">Section {section.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {section.totalStudents} students • {section.classTeacher}
                              </div>
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

        {filteredClasses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No classes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;