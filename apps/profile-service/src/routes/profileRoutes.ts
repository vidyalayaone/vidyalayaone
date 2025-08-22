import { Router } from 'express';
import { createStudent } from '../controllers/createStudent';
import rateLimit from 'express-rate-limit';

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

export default router;
