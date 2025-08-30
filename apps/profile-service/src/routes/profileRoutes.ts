import { Router } from 'express';
import { createStudent } from '../controllers/createStudent';
import { deleteStudents } from '../controllers/deleteStudents';
import { getStudent } from '../controllers/getStudent';
import { getAllStudents } from '../controllers/getAllStudents';
import { createTeacher } from '../controllers/createTeacher';
import { deleteTeachers } from '../controllers/deleteTeachers';
import { getTeacher } from '../controllers/getTeacher';
import { getAllTeachers } from '../controllers/getAllTeachers';
import { getMyTeacherId } from '../controllers/getMyTeacherId';
import rateLimit from 'express-rate-limit';
import { createStudentDocument } from '../controllers/documents/uploadDocument';
import { listStudentDocuments } from '../controllers/documents/listStudentDocuments';
import { getStudentDocument } from '../controllers/documents/getStudentDocument';

const router: Router = Router();

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

// Student routes
router.post('/students', profileLimiter, createStudent);
router.delete('/students', profileLimiter, deleteStudents);
router.get('/students/:id', profileLimiter, getStudent);
router.get('/schools/students', profileLimiter, getAllStudents);
// Student documents
router.post('/students/:id/documents', profileLimiter, createStudentDocument);
router.get('/students/:id/documents', profileLimiter, listStudentDocuments);
router.get('/students/:id/documents/:docId', profileLimiter, getStudentDocument);

// Teacher routes
router.post('/teachers', profileLimiter, createTeacher);
router.delete('/teachers', profileLimiter, deleteTeachers);
router.get('/teachers/:id', profileLimiter, getTeacher);
router.get('/schools/teachers', profileLimiter, getAllTeachers);
router.get('/me/teacher-id', profileLimiter, getMyTeacherId);

export default router;