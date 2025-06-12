// models/TicketCounter.js
import mongoose from 'mongoose';

const ticketCounterSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 1
  }
});

const TicketCounter = mongoose.model('TicketCounter', ticketCounterSchema);
export default TicketCounter;