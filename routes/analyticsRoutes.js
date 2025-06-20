// src/routes/analyticsRoutes.js
import express from 'express';
import { 
  getPriorityResolutionTimes,
  getEmployeePerformance
} from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes and restrict to admins
router.use(protect, restrictTo('admin'));

router.get('/priority-resolution-times', getPriorityResolutionTimes);
router.get('/employee-performance', getEmployeePerformance);

export default router;