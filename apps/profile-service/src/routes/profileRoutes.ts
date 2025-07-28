import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/authorization';

const router: Router = Router();

// All profile routes require authentication and school context
router.use(authenticate);
router.use(requireSchoolContext);

// Self profile management routes
router.get('/me', profileController.getMyProfile);
router.patch('/me', profileController.updateMyProfile);

export default router;
