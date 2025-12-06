import express from 'express';
import { getAttendanceStats } from '../Controllers/AttendanceController.js';


const router = express.Router();

// Attendance stats endpoint
router.get('/attendance/stats', getAttendanceStats);

export default router;