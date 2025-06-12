import Ticket from '../models/Ticket.js';
import AppError from '../utils/appError.js';

export const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

export const getAllTickets = async (filter) => {
  return await Ticket.find(filter).populate('user assignedTo company');
};

export const getTicketById = async (id) => {
  const ticket = await Ticket.findById(id).populate('user assignedTo company');
  if (!ticket) {
    throw new AppError('No ticket found with that ID', 404);
  }
  return ticket;
};

export const updateTicket = async (id, updateData) => {
  const ticket = await Ticket.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!ticket) {
    throw new AppError('No ticket found with that ID', 404);
  }

  return ticket;
};

export const deleteTicket = async (id) => {
  const ticket = await Ticket.findByIdAndDelete(id);
  if (!ticket) {
    throw new AppError('No ticket found with that ID', 404);
  }
  return ticket;
};