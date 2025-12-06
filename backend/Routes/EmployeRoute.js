import express from 'express';
import { getActiveEmployees, getEmpleyesAtDate} from '../Controllers/EmployeController.js';

const router = express.Router();

// Get active employees
router.get('/employees:date', getEmpleyesAtDate);
router.get('/employees/active', getActiveEmployees);


export default router;