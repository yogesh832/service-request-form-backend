import express from 'express';
import { exportResource ,exportPreview } from '../controllers/exportController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:resource/:format', protect, restrictTo('admin'), exportResource);
router.get('/export/:resource/json', protect, restrictTo('admin'), exportPreview);
export default router;
