import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin, requireSchoolContext } from '../middleware/authorization';

const router: Router = Router();

// All teacher routes require authentication and school context
router.use(authenticate);
router.use(requireSchoolContext);

// Admin-only teacher management routes
router.post('/', requireAdmin, teacherController.createTeacher);
router.get('/', requireAdmin, teacherController.getTeachers);
router.get('/:id', requireAdmin, teacherController.getTeacherById);
router.put('/:id', requireAdmin, teacherController.updateTeacher);
router.delete('/:id', requireAdmin, teacherController.deleteTeacher);
router.post('/:id/reset-password', requireAdmin, teacherController.resetTeacherPassword);

export default router;
