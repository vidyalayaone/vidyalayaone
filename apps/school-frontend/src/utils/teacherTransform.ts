import { ProfileServiceTeacher, Teacher } from '@/api/types';

/**
 * Transform ProfileServiceTeacher data from backend to frontend Teacher interface
 */
export function transformProfileTeacherToTeacher(profileTeacher: ProfileServiceTeacher): Teacher {
  return {
    id: profileTeacher.userId, // Use userId as the main ID for frontend
    username: `${profileTeacher.firstName.toLowerCase()}.${profileTeacher.lastName.toLowerCase()}`, // Generate username
    email: 'N/A', // Backend doesn't provide email, will need to get from auth service
    firstName: profileTeacher.firstName,
    lastName: profileTeacher.lastName,
    role: {
      id: 'teacher-role',
      name: 'TEACHER',
      permissions: []
    },
    avatar: undefined, // Backend doesn't provide avatar
    phoneNumber: undefined, // Backend doesn't provide phone
    schoolId: 'N/A', // Backend doesn't include schoolId in response
    isActive: true, // Assume active if returned by API
    createdAt: profileTeacher.createdAt,
    updatedAt: profileTeacher.updatedAt,
    
    // Teacher-specific fields
    employeeId: profileTeacher.employeeId,
    joiningDate: profileTeacher.joiningDate || 'N/A',
    qualification: profileTeacher.qualifications || 'N/A',
    experience: profileTeacher.experienceYears || 0,
    subjects: profileTeacher.subjects.map(subject => ({
      ...subject,
      description: 'N/A',
      isActive: true
    })),
    classes: [], // Backend doesn't provide class assignments in this response
    address: profileTeacher.address || {
      street: 'N/A',
      city: 'N/A',
      state: 'N/A',
      postalCode: 'N/A',
      country: 'N/A'
    },
    emergencyContact: {
      name: 'N/A',
      relationship: 'N/A',
      phoneNumber: 'N/A'
    },
    salary: profileTeacher.salary,
    dateOfBirth: profileTeacher.dateOfBirth || 'N/A',
    gender: profileTeacher.gender || 'MALE',
    bloodGroup: profileTeacher.bloodGroup,
    maritalStatus: profileTeacher.maritalStatus || 'SINGLE'
  };
}

/**
 * Transform array of ProfileServiceTeacher to Teacher array
 */
export function transformProfileTeachersToTeachers(profileTeachers: ProfileServiceTeacher[]): Teacher[] {
  return profileTeachers.map(transformProfileTeacherToTeacher);
}
