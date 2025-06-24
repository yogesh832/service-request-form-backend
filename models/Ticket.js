// models/Ticket.js
import mongoose from 'mongoose';
import Company from './Company.js';
import TicketCounter from './TicketCounter.js'; // Add this import

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  phone:{
    type:String,
  
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
category: {
  type: String,
  enum: ['technical', 'billing', 'account', 'delivery', 'other'],
  default: 'technical'
},
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [
    {
      originalname: String,
      filename: String,
      path: String,
      size: Number,
      mimetype: String
    }
  ],
   createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Auto-generate ticketNumber
ticketSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  try {
    const company = await Company.findById(this.company);
    if (!company) throw new Error('Company not found');

    const counter = await TicketCounter.findOneAndUpdate(
      { company: this.company },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const now = new Date();
    const datePart = [
      now.getFullYear().toString().slice(-2),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0')
    ].join('');

    this.ticketNumber = `${company.abbreviation}-${datePart}-${counter.count.toString().padStart(3, '0')}`;

    next();
  } catch (err) {
    next(err);
  }
});

// Auto-set resolvedAt if status becomes 'resolved'
ticketSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved') {
    this.resolvedAt = new Date();
  }
  next();
});



const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;