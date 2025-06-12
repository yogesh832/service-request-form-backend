import express from "express";
import {
  getAllTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  uploadTicketFiles,
  resizeTicketFiles,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllTickets).post(createTicket);

router
  .route("/:id")
  .get(getTicket)
  .patch(uploadTicketFiles, resizeTicketFiles, updateTicket)
  .delete(deleteTicket);

export default router;
