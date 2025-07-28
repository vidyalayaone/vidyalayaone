import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin, requireSchoolContext } from '../middleware/authorization';

const router: Router = Router();

// All student routes require authentication and school context
router.use(authenticate);
router.use(requireSchoolContext);

// Admin-only student management routes
router.post('/', requireAdmin, studentController.createStudent);
router.get('/', requireAdmin, studentController.getStudents);
router.get('/:id', requireAdmin, studentController.getStudentById);
router.put('/:id', requireAdmin, studentController.updateStudent);
router.delete('/:id', requireAdmin, studentController.deleteStudent);
router.post('/:id/reset-password', requireAdmin, studentController.resetStudentPassword);

export default router;
