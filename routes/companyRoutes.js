import express from 'express';
import {
  getAllCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany
} from '../controllers/companyController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// router.use(protect, restrictTo('admin'));

// router
//   .route('/')
//   .get(getAllCompanies)
//   .post(createCompany);

// router
//   .route('/:id')
//   .get(getCompany)
//   .patch(updateCompany)
//   .delete(deleteCompany);



router.get('/', getAllCompanies); // move this above protect middleware

router.use(protect, restrictTo('admin'));

router
  .route('/')
  .post(createCompany); // only admin can create

router
  .route('/:id')
  .get(getCompany)
  .patch(updateCompany)
  .delete(deleteCompany);

export default router;
