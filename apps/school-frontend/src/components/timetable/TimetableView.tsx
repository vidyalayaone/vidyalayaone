// Reusable timetable view component

import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isBreak?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  teacherId: string;
}

export interface TimetableCell {
  id: string;
  timeSlotId: string;
  sectionId: string;
  subject?: Subject;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface Section {
  id: string;
  name: string;
  grade: string;
  classTeacher: string;
  studentCount: number;
}

export interface TimetableData {
  id: string;
  name: string;
  academicYear: string;
  status: 'draft' | 'active' | 'archived';
  cells: TimetableCell[];
  timeSlots: TimeSlot[];
  sections: Section[];
}

interface TimetableViewProps {
  timetable: TimetableData;
  compact?: boolean;
  className?: string;
}

const TimetableView: React.FC<TimetableViewProps> = ({ 
  timetable, 
  compact = false, 
  className = '' 
}) => {
  // Generate timetable matrix for display
  const timetableMatrix = React.useMemo(() => {
    const matrix: { [key: string]: TimetableCell } = {};
    
    // Fill with existing data
    timetable.cells.forEach(cell => {
      const key = `${cell.timeSlotId}-${cell.sectionId}`;
      matrix[key] = cell;
    });

    return matrix;
  }, [timetable.cells]);

  const getCellContent = (timeSlotId: string, sectionId: string) => {
    const cell = timetableMatrix[`${timeSlotId}-${sectionId}`];
    const timeSlot = timetable.timeSlots.find(ts => ts.id === timeSlotId);
    
    if (timeSlot?.isBreak) {
      return (
        <div className={`text-center bg-yellow-100 rounded text-yellow-800 font-medium ${
          compact ? 'py-1 text-xs' : 'py-3 text-sm'
        }`}>
          {compact ? 'Break' : timeSlot.label}
        </div>
      );
    }

    if (cell?.subject) {
      return (
        <div className={`text-center bg-blue-50 border border-blue-200 rounded ${
          compact ? 'py-1' : 'py-3'
        }`}>
          <div className={`font-semibold text-blue-900 ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            {compact ? cell.subject.code : cell.subject.name}
          </div>
          {!compact && (
            <div className="text-xs text-blue-700 mt-1">{cell.subject.teacher}</div>
          )}
        </div>
      );
    }

    return (
      <div className={`text-center text-gray-400 ${compact ? 'py-1' : 'py-3'}`}>
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {compact ? '-' : 'Free Period'}
        </span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 text-xs">Time</TableHead>
              {timetable.sections.map((section) => (
                <TableHead key={section.id} className="text-center min-w-20 text-xs">
                  <div>
                    <div className="font-semibold">{section.grade.replace('Grade ', 'G')}</div>
                    <div className="text-xs">{section.name}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetable.timeSlots.map((timeSlot) => (
              <TableRow key={timeSlot.id}>
                <TableCell className="text-xs">
                  <div>
                    <div className="font-semibold">{timeSlot.label.replace('Period ', 'P')}</div>
                    <div className="text-xs text-gray-600">
                      {timeSlot.startTime}
                    </div>
                  </div>
                </TableCell>
                {timetable.sections.map((section) => (
                  <TableCell key={section.id} className="p-1">
                    {getCellContent(timeSlot.id, section.id)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {timetable.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Academic Year: {timetable.academicYear}
            </p>
          </div>
          <Badge variant={timetable.status === 'active' ? 'default' : 'secondary'}>
            {timetable.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 font-semibold">Time</TableHead>
                {timetable.sections.map((section) => (
                  <TableHead key={section.id} className="text-center min-w-40 font-semibold">
                    <div>
                      <div>{section.grade}</div>
                      <div className="text-sm font-normal text-gray-600">{section.name}</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetable.timeSlots.map((timeSlot) => (
                <TableRow key={timeSlot.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-sm font-semibold">{timeSlot.label}</div>
                      <div className="text-xs text-gray-600">
                        {timeSlot.startTime} - {timeSlot.endTime}
                      </div>
                    </div>
                  </TableCell>
                  {timetable.sections.map((section) => (
                    <TableCell key={section.id} className="p-2">
                      {getCellContent(timeSlot.id, section.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableView;
