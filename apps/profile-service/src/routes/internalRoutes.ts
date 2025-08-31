import { Router } from 'express';
import { getTeacherDetails } from '../controllers/internal/getTeacherDetails';

const router: Router = Router();

// Internal route to get teacher details by teacher ID
router.get('/teachers/:teacherId', getTeacherDetails);

export default router;
