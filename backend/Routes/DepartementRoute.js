import express from 'express';  
import { getDepartements} from '../Controllers/DepartementController.js';

const router = express.Router();

// Get all departements
router.get('/departements', getDepartements);


export default router;