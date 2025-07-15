// controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";
import { sendEmail } from "../services/emailService.js";
import {
  ticketCreatedTemplate,
  ticketReminderTemplate,
  ticketResolvedTemplate,
  generateTicketTable
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
    const { subject, description, priority, category, phone, origin } =
      req.body;

    if (!req.user.company) {
      return res.status(400).json({
        status: "error",
        message: "Company not found",
      });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      category,
      phone,
      company: req.user.company,
      user: req.user._id,
      attachments: req.attachments || [],
    });

    if (!ticket) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create ticket",
      });
    }

    const populatedTicket = await Ticket.findById(ticket._id).populate(
      "user company"
    );
    console.log(populatedTicket);
    // 1️⃣ Email to Client
    await sendEmail({
      to: populatedTicket.user.email,
      subject: `🎫 SALKATECH Ticket Created: ${populatedTicket.ticketNumber}`,
      html: ticketCreatedTemplate(populatedTicket, origin),
    });


    const [supervisor, director, admin] = await Promise.all([
      User.findOne({ name: "Supervisior" }),
      User.findOne({ name: "Director" }),
      User.findOne({ role: "admin" }),
    ]);

    const adminEmail = admin[0].email; // Assuming admin email is stored in the User model
    const ticketViewUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${populatedTicket._id}`;
    console.log("adminEmail", adminEmail);
    console.log("supervisor", supervisor);
    console.log("Director", director);
    // 2️⃣ Email to Admin
    await sendEmail({
      to: adminEmail,
      subject: `New Ticket Created: ${populatedTicket.ticketNumber}`,
      html: `
    <p>Hello Admin,</p>
    <p>A new ticket has been created. Please assign it to a suitable engineer.</p>
    <ul>
      <li><strong>Ticket Number:</strong> ${populatedTicket.ticketNumber}</li>
      <li><strong>Title:</strong> ${populatedTicket.subject}</li>
      <li><strong>Severity:</strong> ${populatedTicket.priority}</li>
    </ul>
      ${generateTicketTable(populatedTicket)}
    <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">🔍 View Ticket</a>
  `,
    });

    // 3️⃣ Email to Support (and optionally L1 if severity = high)
    const supportEmail = adminEmail;
    const l1Email = supervisor?.email; // Assuming supervisor is the L1 engineer

    let supportEmailBody = `
  <p>Hello Support Team,</p>
  <p>A new ticket has been generated.</p>
  <ul>
    <li><strong>Ticket Number:</strong> ${populatedTicket.ticketNumber}</li>
    <li><strong>Title:</strong> ${populatedTicket.subject}</li>
    <li><strong>Severity:</strong> ${populatedTicket.priority}</li>
  </ul>
    ${generateTicketTable(populatedTicket)}

  <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">🔍 View Ticket</a>
`;

    await sendEmail({
      to: supportEmail,
      subject: `📩 New Ticket Created: ${populatedTicket.ticketNumber}`,
      html: supportEmailBody,
    });

if (populatedTicket.priority === "high") {
  await sendEmail({
    to: l1Email,
    subject: `⚠️ High Severity Ticket Alert: ${populatedTicket.ticketNumber}`,
    html: supportEmailBody + `
    
    ${generateTicketTable(populatedTicket)}
    <p>This ticket is marked as <strong>high priority</strong>. Please act immediately.</p>`,
  });
}


    res.status(201).json({
      status: "success",
      data: { ticket: populatedTicket },
    });
  } catch (error) {
    const message = error.message || "Failed to create ticket";
    res.status(500).json({ status: "error", message });
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
// export const assignTicket = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { assignedTo } = req.body;

//     const ticket = await Ticket.findByIdAndUpdate(
//       id,
//       { assignedTo },
//       { new: true, runValidators: true }
//     ).populate("assignedTo");

//     if (!ticket) {
//       return next(new AppError("No ticket found with that ID", 404));
//     }
//     if (assignedTo && ticket.assignedTo) {
//       await sendEmail({
//         to: ticket.assignedTo.email,
//         subject: `New Ticket Assigned: ${ticket.ticketNumber}`,
//         html: `<p>Hello ${ticket.assignedTo.name},</p>
//                <p>A new ticket has been assigned to you. Please check and resolve it ASAP.</p>
//                <p>Ticket Subject: ${ticket.subject}</p>`,
//       });
//     }
//     res.status(200).json({
//       status: "success",
//       data: {
//         ticket,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const assignTicket = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { assignedTo } = req.body;

//     const ticket = await Ticket.findByIdAndUpdate(
//       id,
//       { assignedTo },
//       { new: true, runValidators: true }
//     ).populate("assignedTo user");

//     if (!ticket) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "No ticket found with that ID" });
//     }

//     // 1️⃣ Email to assigned engineer
//     if (assignedTo && ticket.assignedTo) {
//       await sendEmail({
//         to: ticket.assignedTo.email,
//         subject: `📌 New Ticket Assigned: ${ticket.ticketNumber}`,
//         html: `<p>Hello ${ticket.assignedTo.name},</p>
//                <p>A new ticket has been assigned to you. Please resolve it as soon as possible.</p>
//                <ul>
//                  <li><strong>Subject:</strong> ${ticket.subject}</li>
//                  <li><strong>Priority:</strong> ${ticket.priority}</li>
//                </ul>
//                <a href="https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none;">View Ticket</a>`,
//       });
//     }

//     // 2️⃣ Email to client about engineer assignment
//     if (ticket.user?.email && ticket.assignedTo?.name) {
//       await sendEmail({
//         to: ticket.user.email,
//         subject: `👨‍🔧 Engineer Assigned to Your Ticket: ${ticket.ticketNumber}`,
//         html: `<p>Hello ${ticket.user.name},</p>
//                <p>We have assigned <strong>Er. ${ticket.assignedTo.name}</strong> to assist you with your ticket.</p>
//                <p>They will reach out to you shortly.</p>`,
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: { ticket },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// updated assign sample one
// export const assignTicket = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { assignedTo } = req.body;

//     // 1️⃣ Get the ticket first to know old assigned engineer
//     const oldTicket = await Ticket.findById(id).populate("assignedTo user");
//     if (!oldTicket) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "No ticket found with that ID" });
//     }

//     const oldEngineer = oldTicket.assignedTo;

//     // 2️⃣ Update ticket with new assigned engineer
//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       id,
//       { assignedTo },
//       { new: true, runValidators: true }
//     ).populate("assignedTo user");

//     const newEngineer = updatedTicket.assignedTo;
//     const ticketUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${updatedTicket._id}`;

//     // 3️⃣ Email to newly assigned engineer
//     if (assignedTo && newEngineer) {
//       await sendEmail({
//         to: newEngineer.email,
//         subject: `📌 New Ticket Assigned: ${updatedTicket.ticketNumber}`,
//         html: `
//           <p>Hello ${newEngineer.name},</p>
//           <p>A ticket has been assigned to you. Please resolve it as soon as possible.</p>
//           <ul>
//             <li><strong>Ticket:</strong> ${updatedTicket.ticketNumber}</li>
//             <li><strong>Subject:</strong> ${updatedTicket.subject}</li>
//             <li><strong>Priority:</strong> ${updatedTicket.priority}</li>
//           </ul>
//           <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">View Ticket</a>
//         `,
//       });
//     }

//     // 4️⃣ Email to client about reassignment
//     // if (updatedTicket.user?.email && newEngineer?.name) {
//     //   const reassignedText = oldEngineer
//     //     ? `We have <strong>re-assigned</strong> your ticket from <strong>Er. ${oldEngineer.name}</strong> to <strong>Er. ${newEngineer.name}</strong>.`
//     //     : `We have <strong>assigned</strong> <strong>Er. ${newEngineer.name}</strong> to assist you with your ticket.`;

//     //   await sendEmail({
//     //     to: updatedTicket.user.email,
//     //     subject: `👨‍🔧 Engineer ${oldEngineer ? "Re-" : ""}Assigned: Ticket ${updatedTicket.ticketNumber}`,
//     //     html: `
//     //       <p>Hello ${updatedTicket.user.name},</p>
//     //       <p>${reassignedText}</p>
//     //       <p>They will reach out to you shortly.</p>
//     //       <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">View Ticket</a>
//     //     `,
//     //   });
//     // }
//     if (updatedTicket.user?.email && newEngineer?.name) {
//   const reassignedText = oldEngineer
//     ? `We have <strong>re-assigned</strong> your ticket from <strong>Er. ${oldEngineer.name}</strong> to <strong>Er. ${newEngineer.name}</strong>.`
//     : `We have <strong>assigned</strong> <strong>Er. ${newEngineer.name}</strong> to assist you with your ticket.`;

//   await sendEmail({
//     to: updatedTicket.user.email,
//     subject: `👨‍🔧 Engineer ${oldEngineer ? "Re-" : ""}Assigned: Ticket ${updatedTicket.ticketNumber}`,
//     html: `
//       <p>Hello ${updatedTicket.user.name},</p>
//       <p>${reassignedText}</p>
//       <ul>
//         <li><strong>Ticket Number:</strong> ${updatedTicket.ticketNumber}</li>
//         <li><strong>Title:</strong> ${updatedTicket.subject}</li>
//       </ul>
//       <p>They will reach out to you shortly.</p>
//       <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">View Ticket</a>
//     `,
//   });
// }

//     res.status(200).json({
//       status: "success",
//       data: { ticket: updatedTicket },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Add status update controller
// export const updateTicketStatus = async (req, res, next) => {
//   try {
//     const { status } = req.body;
//     const ticket = await Ticket.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true, runValidators: true }
//     );

//     if (!ticket) {
//       return next(new AppError('No ticket found with that ID', 404));
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
// Update the updateTicketStatus function
// export const updateTicketStatus = async (req, res, next) => {
//   try {
//     const { status } = req.body;
//     const update = { status };

//     // Set resolvedAt timestamp when status changes to resolved
//     if (status === 'resolved') {
//       update.resolvedAt = new Date();

//       // Track resolution event for analytics
//       // You'll need to implement your analytics tracking system here
//       // Example: analytics.track('ticket_resolved', { ticketId: req.params.id });
//     }

//     const ticket = await Ticket.findByIdAndUpdate(
//       req.params.id,
//       update,
//       { new: true, runValidators: true }
//     );

//     if (!ticket) {
//       return next(new AppError("No ticket found with that ID", 404));
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         ticket,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// new assign method
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // 1️⃣ Fetch the current ticket to get existing assigned engineer
    const oldTicket = await Ticket.findById(id).populate("assignedTo user");
    if (!oldTicket) {
      return res
        .status(404)
        .json({ status: "error", message: "No ticket found with that ID" });
    }

    // 🔴 Prevent assigning the same engineer again
    if (oldTicket.assignedTo?._id?.toString() === assignedTo) {
      return res.status(400).json({
        status: "error",
        message: `This ticket is already assigned to Er. ${oldTicket.assignedTo.name}`,
      });
    }

    // 2️⃣ Update the ticket with the new engineer
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true, runValidators: true }
    ).populate("assignedTo user");

    const oldEngineer = oldTicket.assignedTo;
    const newEngineer = updatedTicket.assignedTo;
    const ticketUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${updatedTicket._id}`;

    // 3️⃣ Send email to new engineer
    if (newEngineer) {
      await sendEmail({
        to: newEngineer.email,
        subject: `📌 New Ticket Assigned: ${updatedTicket.ticketNumber}`,
        html: `
          <p>Hello ${newEngineer.name},</p>
          <p>A ticket has been assigned to you. Please resolve it as soon as possible.</p>
          <ul>
            <li><strong>Ticket:</strong> ${updatedTicket.ticketNumber}</li>
            <li><strong>Title:</strong> ${updatedTicket.subject}</li>
            <li><strong>Priority:</strong> ${updatedTicket.priority}</li>
          </ul>
            ${generateTicketTable(updatedTicket)}

          <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">View Ticket</a>
        `,
      });
    }

    // 4️⃣ Send email to client
    if (updatedTicket.user?.email && newEngineer?.name) {
      const reassignedText = oldEngineer
        ? `We have <strong>re-assigned</strong> your ticket from <strong>Er. ${oldEngineer.name}</strong> to <strong>Er. ${newEngineer.name}</strong>.`
        : `We have <strong>assigned</strong> <strong>Er. ${newEngineer.name}</strong> to assist you with your ticket.`;

      await sendEmail({
        to: updatedTicket.user.email,
        subject: `👨‍🔧 Engineer ${oldEngineer ? "Re-" : ""}Assigned: Ticket ${
          updatedTicket.ticketNumber
        }`,
        html: `
          <p>Hello ${updatedTicket.user.name},</p>
          <p>${reassignedText}</p>
          <ul>
            <li><strong>Ticket Number:</strong> ${updatedTicket.ticketNumber}</li>
            <li><strong>Title:</strong> ${updatedTicket.subject}</li>
          </ul>
            ${generateTicketTable(updatedTicket)}

          <p>They will reach out to you shortly.</p>
          <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #4b0082; color: white; text-decoration: none; border-radius: 4px;">View Ticket</a>
        `,
      });
    }

    res.status(200).json({
      status: "success",
      data: { ticket: updatedTicket },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };

    // ✔️ Agar ticket resolved ho rahi hai to resolvedAt set karo
    if (status === "resolved") {
      update.resolvedAt = new Date();
    }

    // ✔️ Update + user ko populate karo (jise ticket bheji gayi thi)
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("user"); // 👈 Important for email sending

    if (!ticket) {
      return next(new AppError("No ticket found with that ID", 404));
    }

    // ✔️ Send resolved email only if status === resolved
    if (status === "resolved" && ticket.user?.email) {
      await sendEmail({
        to: ticket.user.email,
        subject: `✅ Your ticket "${ticket.subject}" has been resolved`,
        html: ticketResolvedTemplate({
          name: ticket.user.name,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          resolvedAt: ticket.resolvedAt,
        }),
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
