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
import { uploadUserPhoto, resizeUserPhoto } from '../middlewares/uploadMiddleware.js';


const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/me', protect,  uploadUserPhoto,
  resizeUserPhoto, updateMe);


router.use(protect, restrictTo('admin'));
router.route('/employees').get(getAllUsers);
router
  .route('/')
  .get(getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);


export default router;


// routes/userRoutes.js

// import express from 'express';
// import {
//   getAllUsers,
//   getUser,
//   updateUser,
//   deleteUser,
//   getMe,
//   updateMe
// } from '../controllers/userController.js';
// import { protect, restrictTo } from '../middlewares/authMiddleware.js';

// const router = express.Router();

// /**
//  * PUBLIC: none
//  * PROTECTED: all routes below this line
//  */

// // ✅ Routes for logged-in users
// router.use(protect);

// router.get('/me', getMe);
// router.patch('/me', updateMe);

// // ✅ Admin-only routes
// router.use(restrictTo('admin'));

// router
//   .route('/')
//   .get(getAllUsers);

// router
//   .route('/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// export default router;
