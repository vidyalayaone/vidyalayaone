// Timetable summary card component

import React from 'react';
import { 
  Calendar,
  Clock,
  Users,
  BookOpen,
  Edit,
  Eye,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TimetableSummary {
  id: string;
  name: string;
  academicYear: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  totalTimeSlots: number;
  totalSections: number;
  assignedClasses: number;
  completionPercentage: number;
}

interface TimetableSummaryCardProps {
  timetable: TimetableSummary;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isSelected?: boolean;
}

const TimetableSummaryCard: React.FC<TimetableSummaryCardProps> = ({
  timetable,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  isSelected = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {timetable.name}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Academic Year: {timetable.academicYear}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(timetable.status)}>
              {timetable.status}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(timetable.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(timetable.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(timetable.id)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(timetable.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Time Slots</p>
              <p className="text-sm font-semibold">{timetable.totalTimeSlots}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Sections</p>
              <p className="text-sm font-semibold">{timetable.totalSections}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Assigned</p>
              <p className="text-sm font-semibold">{timetable.assignedClasses}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center">
              <div className={`text-xs font-bold ${getCompletionColor(timetable.completionPercentage)}`}>
                %
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600">Complete</p>
              <p className={`text-sm font-semibold ${getCompletionColor(timetable.completionPercentage)}`}>
                {timetable.completionPercentage}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              timetable.completionPercentage >= 80 ? 'bg-green-600' :
              timetable.completionPercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${timetable.completionPercentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Updated: {new Date(timetable.updatedAt).toLocaleDateString()}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(timetable.id)}
            className="h-7 text-xs"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableSummaryCard;
