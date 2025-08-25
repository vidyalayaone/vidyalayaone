import { ProfileServiceTeacher, ProfileServiceTeacherDetail, Teacher } from '@/api/types';

/**
 * Transform ProfileServiceTeacher data from backend to frontend Teacher interface
 */
export function transformProfileTeacherToTeacher(profileTeacher: ProfileServiceTeacher): Teacher {
  return {
    id: profileTeacher.id, // Use the actual teacher ID from backend for navigation
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
 * Transform ProfileServiceTeacherDetail data from backend to frontend Teacher interface
 */
export function transformProfileTeacherDetailToTeacher(profileTeacherDetail: ProfileServiceTeacherDetail): Teacher {
  const { teacher, userDetails } = profileTeacherDetail;
  
  return {
    id: teacher.id, // Use the actual teacher ID from backend for consistency
    username: userDetails?.username || `${teacher.firstName.toLowerCase()}.${teacher.lastName.toLowerCase()}`,
    email: userDetails?.email || 'N/A',
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    role: {
      id: 'teacher-role',
      name: 'TEACHER',
      permissions: []
    },
    avatar: undefined, // Backend doesn't provide avatar
    phoneNumber: userDetails?.phone,
    schoolId: teacher.schoolId,
    isActive: userDetails?.isActive ?? true,
    createdAt: teacher.createdAt,
    updatedAt: teacher.updatedAt,
    
    // Teacher-specific fields
    employeeId: teacher.employeeId,
    joiningDate: teacher.joiningDate || 'N/A',
    qualification: teacher.qualifications || 'N/A',
    experience: teacher.experienceYears || 0,
    subjects: teacher.subjects.map(subject => ({
      ...subject,
      description: 'N/A',
      isActive: true
    })),
    classes: [], // Backend doesn't provide class assignments in this response
    address: teacher.address || {
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
    salary: teacher.salary,
    dateOfBirth: teacher.dateOfBirth || 'N/A',
    gender: teacher.gender || 'MALE',
    bloodGroup: teacher.bloodGroup,
    maritalStatus: teacher.maritalStatus || 'SINGLE'
  };
}

/**
 * Transform array of ProfileServiceTeacher to Teacher array
 */
export function transformProfileTeachersToTeachers(profileTeachers: ProfileServiceTeacher[]): Teacher[] {
  return profileTeachers.map(transformProfileTeacherToTeacher);
}
