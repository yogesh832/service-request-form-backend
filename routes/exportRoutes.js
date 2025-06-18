import express from 'express';
import {
  exportUsersExcel,
  exportUsersPDF,
  exportTicketsExcel,
  exportTicketsPDF
} from '../controllers/exportController.js';

const router = express.Router();

router.get('/users/excel', exportUsersExcel);
router.get('/users/pdf', exportUsersPDF);
router.get('/tickets/excel', exportTicketsExcel);
router.get('/tickets/pdf', exportTicketsPDF);

export default router;