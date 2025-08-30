import { Router } from 'express';
import { register } from '../controllers/register';
import { resendOtp } from '../controllers/resendOtp';
import { verifyOtpForRegistration } from '../controllers/verifyOtpForRegistration';
import { login } from "../controllers/login";
import { refreshToken } from "../controllers/refreshToken";
import { getMe } from "../controllers/getMe";
import { getMySchool } from "../controllers/getMySchool";
import { forgotPassword } from '../controllers/forgotPassword';
import { verifyOtpForPasswordReset } from '../controllers/verifyOtpForPasswordReset';
import { resetPassword } from '../controllers/resetPassword';
import { logout } from '../controllers/logout';
import { updateAdminWithSchoolId } from '../controllers/updateAdminWithSchoolId';
import { seedRoles } from '../controllers/seedRoles';
import rateLimit from 'express-rate-limit';

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: { message: 'Too many attempts, please try again later.' },
    timestamp: new Date().toISOString()
  }
});


// protected = false
router.post('/register', strictLimiter, register);
router.post('/resend-otp', strictLimiter, resendOtp);
router.post('/verify-otp/registration', strictLimiter, verifyOtpForRegistration);
router.post('/login', strictLimiter, login);
router.post('/refresh-token', strictLimiter, refreshToken);
router.post('/forgot-password', strictLimiter, forgotPassword); // needs to be updated
router.post('/verify-otp/password-reset', strictLimiter, verifyOtpForPasswordReset); // needs to be updated
router.post('/reset-password', strictLimiter, resetPassword); // needs to be updated

// protected = true
router.get('/me', authLimiter, getMe);
router.get('/my-school', authLimiter, getMySchool);
router.post('/logout', authLimiter, logout);
router.post('/update-admin-with-schoolId', updateAdminWithSchoolId);

// Additional protected routes can be added here
router.post('/seed-roles', authLimiter, seedRoles);

export default router;
