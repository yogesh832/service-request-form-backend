import express from "express";
import {
  getAllTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateTicketStatus
} from "../controllers/ticketController.js";

import { protect } from "../middlewares/authMiddleware.js";

import {
  uploadTicketFiles,
  processTicketFiles
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for tickets
router
  .route("/")
  .get(getAllTickets)
  .post(uploadTicketFiles, processTicketFiles, createTicket); // Apply middleware on create

router
  .route("/:id")
  .get(getTicket)
  .patch(uploadTicketFiles, processTicketFiles, updateTicket) // Apply middleware on update
  .delete(deleteTicket);

// Route to assign a ticket
router.patch("/:id/assign", assignTicket);

// Route to update ticket status
router.patch("/:id/status", updateTicketStatus);

export default router;
