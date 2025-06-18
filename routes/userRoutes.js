import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  getEmployees
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js'; // Updated import

const router = express.Router();
router.patch(
  '/me', 
  protect, 
  uploadProfilePhoto, 
  // Cloudinary middleware
  updateMe
);
router.get('/me', protect, getMe);


router.use(protect, restrictTo('admin'));
router.route('/employees').get(getAllUsers);

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;