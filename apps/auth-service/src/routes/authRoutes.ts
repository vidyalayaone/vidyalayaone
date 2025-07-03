import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';
import config from '../config/config';

const router: Router = Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: { message: 'Too many attempts, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

// Public routes
router.post('/register/platform', strictLimiter, authController.registerOnPlatform);
router.post('/register/school', strictLimiter, authController.registerOnSchool);

router.post('/verify-otp/platform', strictLimiter, authController.verifyOtpOnPlatform);
router.post('/verify-otp/school', strictLimiter, authController.verifyOtpOnSchool);

router.post('/login/platform', strictLimiter, authController.loginOnPlatform);
router.post('/login/school', strictLimiter, authController.loginOnSchool);

router.post('/refresh-token/platform', authLimiter, authController.refreshTokenOnPlatform);
router.post('/refresh-token/school', authLimiter, authController.refreshTokenOnSchool);

// Protected routes
router.get('/me/platform', authLimiter, authenticate, authController.getMeOnPlatform);
router.get('/me/school', authLimiter, authenticate, authController.getMeOnSchool);

router.post('/logout/platform', authLimiter, authenticate, authController.logoutOnPlatform);
router.post('/logout/school', authLimiter, authenticate, authController.logoutOnSchool);

// Add this route for testing (remove in production)
if (config.server.nodeEnv === 'development') {
  router.post('/test-email', authController.testEmail);
}

export default router;
