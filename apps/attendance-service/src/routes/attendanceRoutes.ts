import { Router } from 'express';
import { markAttendance } from '../controllers/markAttendance';
import { getClassAttendance } from '../controllers/getClassAttendance';
import { getStudentAttendance } from '../controllers/getStudentAttendance';
import { getAttendanceStats } from '../controllers/getAttendanceStats';
import { updateAttendanceRecord } from '../controllers/updateAttendanceRecord';
import { exportAttendance } from '../controllers/exportAttendance';

const router: Router = Router();

// POST /api/v1/attendance/mark - Mark attendance for a class
router.post('/mark', markAttendance);

// GET /api/v1/attendance/class/:classId/section/:sectionId - Get class attendance
router.get('/class/:classId/section/:sectionId', getClassAttendance);

// GET /api/v1/attendance/student/:studentId - Get student attendance
router.get('/student/:studentId', getStudentAttendance);

// GET /api/v1/attendance/stats/:classId/section/:sectionId - Get attendance statistics
router.get('/stats/:classId/section/:sectionId', getAttendanceStats);

// PUT /api/v1/attendance/record/:recordId - Update attendance record
router.put('/record/:recordId', updateAttendanceRecord);

// GET /api/v1/attendance/export - Export attendance data
router.get('/export', exportAttendance);

export default router;
