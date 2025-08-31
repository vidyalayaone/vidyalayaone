import axios, { AxiosInstance } from 'axios';
import config from '../config/config';
import type { StudentInfo, ClassInfo, SectionInfo, TeacherInfo } from '../types';

class ExternalServiceClient {
  private profileServiceClient: AxiosInstance;
  private schoolServiceClient: AxiosInstance;

  constructor() {
    this.profileServiceClient = axios.create({
      baseURL: config.services.profile.url,
      timeout: config.services.profile.timeout,
    });

    this.schoolServiceClient = axios.create({
      baseURL: config.services.school.url,
      timeout: config.services.school.timeout,
    });
  }

  // Profile Service Methods
  async getStudentById(studentId: string): Promise<StudentInfo | null> {
    try {
      const response = await this.profileServiceClient.get(`/api/v1/students/${studentId}`);
      
      if (response.data.success && response.data.data) {
        const student = response.data.data;
        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.admissionNumber || student.rollNumber || '',
          classId: student.classId,
          sectionId: student.sectionId,
          schoolId: student.schoolId,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
      return null;
    }
  }

  async getStudentsByClassAndSection(classId: string, sectionId: string): Promise<StudentInfo[]> {
    try {
      const response = await this.profileServiceClient.get(
        `/api/v1/students?classId=${classId}&sectionId=${sectionId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.admissionNumber || student.rollNumber || '',
          classId: student.classId,
          sectionId: student.sectionId,
          schoolId: student.schoolId,
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching students for class ${classId}, section ${sectionId}:`, error);
      return [];
    }
  }

  async getTeacherById(teacherId: string): Promise<TeacherInfo | null> {
    try {
      const response = await this.profileServiceClient.get(`/api/v1/teachers/${teacherId}`);
      
      if (response.data.success && response.data.data) {
        const teacher = response.data.data;
        return {
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          schoolId: teacher.schoolId,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching teacher ${teacherId}:`, error);
      return null;
    }
  }

  // School Service Methods
  async getClassById(classId: string): Promise<ClassInfo | null> {
    try {
      const response = await this.schoolServiceClient.get(`/api/v1/classes/${classId}`);
      
      if (response.data.success && response.data.data) {
        const classData = response.data.data;
        return {
          id: classData.id,
          name: classData.name,
          schoolId: classData.schoolId,
          sections: classData.sections || [],
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching class ${classId}:`, error);
      return null;
    }
  }

  async getSectionById(sectionId: string): Promise<SectionInfo | null> {
    try {
      const response = await this.schoolServiceClient.get(`/api/v1/sections/${sectionId}`);
      
      if (response.data.success && response.data.data) {
        const section = response.data.data;
        return {
          id: section.id,
          name: section.name,
          classId: section.classId,
          studentCount: section.studentCount || 0,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching section ${sectionId}:`, error);
      return null;
    }
  }

  async validateClassAndSection(classId: string, sectionId: string): Promise<boolean> {
    try {
      const [classInfo, sectionInfo] = await Promise.all([
        this.getClassById(classId),
        this.getSectionById(sectionId),
      ]);

      return !!(classInfo && sectionInfo && sectionInfo.classId === classId);
    } catch (error) {
      console.error(`Error validating class ${classId} and section ${sectionId}:`, error);
      return false;
    }
  }

  // Batch methods for performance
  async getStudentsByIds(studentIds: string[]): Promise<Map<string, StudentInfo>> {
    const studentMap = new Map<string, StudentInfo>();
    
    // Batch requests in chunks of 10
    const chunks: string[][] = [];
    for (let i = 0; i < studentIds.length; i += 10) {
      chunks.push(studentIds.slice(i, i + 10));
    }

    const results = await Promise.allSettled(
      chunks.map(chunk => 
        Promise.all(chunk.map(id => this.getStudentById(id)))
      )
    );

    results.forEach((result, chunkIndex) => {
      if (result.status === 'fulfilled') {
        result.value.forEach((student, studentIndex) => {
          if (student) {
            const studentId = chunks[chunkIndex][studentIndex];
            studentMap.set(studentId, student);
          }
        });
      }
    });

    return studentMap;
  }
}

export const externalServiceClient = new ExternalServiceClient();
