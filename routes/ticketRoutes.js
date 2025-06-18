import express from "express";
import {
  getAllTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateTicketStatus
  ,getEmployeesForTicket
} from "../controllers/ticketController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { uploadTicketFiles, processTicketFiles } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";

const router = express.Router();
router.get('/:ticketId/employees', getEmployeesForTicket);
router.use(protect);

router.route("/")
  .get(getAllTickets)
  .post(
    uploadTicketFiles, // Cloudinary upload
    processTicketFiles, // Process to req.attachments
    createTicket
  );

router.route("/:id")
  .get(getTicket)
  .patch(
    uploadTicketFiles,
    processTicketFiles,
    updateTicket
  )
  .delete(deleteTicket);

router.patch("/:id/assign", assignTicket);
router.patch("/:id/status", updateTicketStatus);
// Add this to ticketRoutes.js

export default router;