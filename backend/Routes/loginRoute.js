import express from 'express';
import { login, getAdmins } from '../Controllers/loginController.js';

const router = express.Router();

// Login endpoint
router.post('/login', login);
router.get('/admin', getAdmins);
export default router;