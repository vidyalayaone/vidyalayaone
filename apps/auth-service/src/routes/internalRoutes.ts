import { Router } from 'express';
import { createUserForStudent, deleteUser } from '../controllers/createUserForStudent';
import rateLimit from 'express-rate-limit';

const router: Router = Router();

const internalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for internal requests
  message: {
    success: false,
    error: { message: 'Too many internal requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

// Internal routes (only accessible by other services)
router.post('/create-user-for-student', internalLimiter, createUserForStudent);
router.delete('/users/:userId', internalLimiter, deleteUser);

export default router;
