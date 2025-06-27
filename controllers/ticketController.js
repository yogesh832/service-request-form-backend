// controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";
import { sendEmail } from "../services/emailService.js";
import {
  ticketCreatedTemplate,
  ticketReminderTemplate,
} from "../utils/emailTemplates.js";
import User from "../models/User.js";

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getAllTickets = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === "client") {
      filter.user = req.user._id;
    } else if (req.user.role === "employee") {
      filter.$or = [
        { assignedTo: req.user._id },
        { company: req.user.company },
      ];
    }

    const features = new APIFeatures(Ticket.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tickets = await features.query.populate([
      {
        path: "user",
        populate: {
          path: "company", // nested populate inside user
          model: "Company",
        },
      },
      {
        path: "assignedTo",
        select: "name email role phone", // optional: only select certain fields
      },
      {
        path: "company",
      },
    ]);

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        tickets,
      },
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
    const { subject, description, priority, category, phone } = req.body;

    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      category,
      phone,
      company: req.user.company,
      user: req.user._id,
      attachments: req.attachments || [], // Use processed attachments
    });
    // Map Cloudinary files to attachment object
    const attachments =
      req.files?.map((file) => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path, // Cloudinary URL
        size: file.size,
        mimetype: file.mimetype,
      })) || [];

    const populatedTicket = await Ticket.findById(ticket._id).populate(
      "user company"
    );

    // Send email if needed
    await sendEmail({
      to: populatedTicket.user.email,
      subject: `SALKATech Ticket Created: ${populatedTicket.ticketNumber}`,
      html: ticketCreatedTemplate(populatedTicket),
    });

    res.status(201).json({
      status: "success",
      data: { ticket: populatedTicket },
    });
  } catch (error) {
    next(error);
  }
};
// const getLeastBusyEmployee = async (companyId) => {
//   // Get all employees of company
//   const employees = await User.find({ role: 'employee' });

//   if (!employees.length) return null;

//   // Map employees with count of open tickets assigned to them
//   const employeeTicketsCount = await Promise.all(
//     employees.map(async (emp) => {
//       const count = await Ticket.countDocuments({
//         assignedTo: emp._id,
//         status: { $in: ['open', 'pending'] }  // only open/pending tickets
//       });
//       return { employee: emp, count };
//     })
//   );

//   // Sort by count ascending and return employee with least tickets
//   employeeTicketsCount.sort((a, b) => a.count - b.count);

//   return employeeTicketsCount[0].employee;
// };

// export const createTicket = async (req, res, next) => {
//   try {
//     const { subject, description, priority, category, phone } = req.body;

//     // Get employee with least tickets for assignment
//     const assignedEmployee = await getLeastBusyEmployee(req.user.company);

//     const ticketData = {
//       subject,
//       description,
//       priority,
//       category,
//       phone,
//       company: req.user.company,
//       user: req.user._id,
//       attachments: req.attachments || []
//     };

//     if (assignedEmployee) {
//       ticketData.assignedTo = assignedEmployee._id;
//     }

//     const ticket = await Ticket.create(ticketData);

//     const populatedTicket = await Ticket.findById(ticket._id)
//       .populate('user company assignedTo');

//     // Send ticket created email to ticket owner
//     await sendEmail({
//       to: populatedTicket.user.email,
//       subject: `SALKATech Ticket Created: ${populatedTicket.ticketNumber}`,
//       html: ticketCreatedTemplate(populatedTicket)
//     });

//     // Send assignment email to employee
//     if (assignedEmployee) {
//       await sendEmail({
//         to: assignedEmployee.email,
//         subject: `New Ticket Assigned: ${populatedTicket.ticketNumber}`,
//         html: `<p>Hello ${assignedEmployee.name},</p>
//                <p>A new ticket has been assigned to you. Please check and resolve it ASAP.</p>
//                <p>Ticket Subject: ${ticket.subject}</p>`
//       });
//     }

//     res.status(201).json({
//       status: 'success',
//       data: { ticket: populatedTicket }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
// export const getTicket = async (req, res, next) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id)
//       .populate('user assignedTo company');

//     if (!ticket) {
//       return next(new AppError('No ticket found with that ID', 404));
//     }

//     // Authorization check
//     if (req.user.role === 'client' && !ticket.user.equals(req.user._id)) {
//       return next(new AppError('Not authorized to access this ticket', 403));
//     }

//     if (req.user.role === 'employee' &&
//         !ticket.assignedTo.equals(req.user._id) &&
//         !ticket.company.equals(req.user.company)) {
//       return next(new AppError('Not authorized to access this ticket', 403));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         ticket
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate([
      { path: "user", select: "name email phone profilePhoto" },
      { path: "assignedTo", select: "name email phone profilePhoto" },
      { path: "company", select: "name abbreviation" },
    ]);

    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }

    // Authorization check for client
    if (req.user.role === "client" && !ticket.user.equals(req.user._id)) {
      return next(new AppError("Not authorized to access this ticket", 403));
    }

    // Authorization check for employee
    if (
      req.user.role === "employee" &&
      (!ticket.assignedTo || !ticket.assignedTo._id.equals(req.user._id)) &&
      !ticket.company.equals(req.user.company)
    ) {
      return next(new AppError("Not authorized to access this ticket", 403));
    }

    res.status(200).json({
      status: "success",
      data: { ticket },
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
    const updateData = { ...req.body };

    // Add new attachments if uploaded
    if (req.attachments) {
      updateData.$push = { attachments: { $each: req.attachments } };
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
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
      return next(new AppError("No ticket found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
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
    ).populate("assignedTo");

    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }
    if (assignedTo && ticket.assignedTo) {
      await sendEmail({
        to: ticket.assignedTo.email,
        subject: `New Ticket Assigned: ${ticket.ticketNumber}`,
        html: `<p>Hello ${ticket.assignedTo.name},</p>
               <p>A new ticket has been assigned to you. Please check and resolve it ASAP.</p>
               <p>Ticket Subject: ${ticket.subject}</p>`,
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add status update controller
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Add this to ticketController.js
export const getEmployeesForTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId).populate("company");
    console.log(ticketId);
    console.log(ticket.company._id);
    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }

    // Find employees who belong to the ticket's company
    const employees = await User.find({
      // company: ticket.company._id,
      role: "employee",
    }).select("name email role phone profilePhoto"); // Select only necessary fields

    res.status(200).json({
      status: "success",
      data: {
        employees,
      },
    });
  } catch (error) {
    next(error);
  }
};
