// controllers/ticketController.js
import Ticket from '../models/Ticket.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';


// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getAllTickets = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'client') {
      filter.user = req.user._id;
    } else if (req.user.role === 'employee') {
      filter.$or = [
        { assignedTo: req.user._id },
        { company: req.user.company }
      ];
    }

    const features = new APIFeatures(Ticket.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tickets = await features.query.populate('user assignedTo company');

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: {
        tickets
      }
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority, category } = req.body;
    
    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      category,
      company: req.user.company, // Assuming user is associated with a company
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user assignedTo company');

    if (!ticket) {
      return next(new AppError('No ticket found with that ID', 404));
    }

    // Authorization check
    if (req.user.role === 'client' && !ticket.user.equals(req.user._id)) {
      return next(new AppError('Not authorized to access this ticket', 403));
    }

    if (req.user.role === 'employee' && 
        !ticket.assignedTo.equals(req.user._id) && 
        !ticket.company.equals(req.user.company)) {
      return next(new AppError('Not authorized to access this ticket', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket
// @route   PATCH /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!ticket) {
      return next(new AppError('No ticket found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return next(new AppError('No ticket found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to an employee
// @route   PATCH /api/tickets/:id/assign
// @access  Private/Admin
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo');

    if (!ticket) {
      return next(new AppError('No ticket found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (error) {
    next(error);
  }
};
