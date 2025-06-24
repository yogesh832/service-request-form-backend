import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import { sendEmail } from '../services/emailService.js';
import { ticketReminderTemplate } from '../utils/emailTemplates.js';

// Run every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('Running reminder job every 2 hours');

  try {
    // Find all tickets that are open or pending and assigned
    const tickets = await Ticket.find({
      status: { $in: ['open', 'pending'] },
      assignedTo: { $ne: null }
    }).populate('assignedTo');

    // Group tickets by assigned employee
    const ticketsByEmployee = {};

    tickets.forEach(ticket => {
      const empId = ticket.assignedTo._id.toString();
      if (!ticketsByEmployee[empId]) ticketsByEmployee[empId] = [];
      ticketsByEmployee[empId].push(ticket);
    });

    // Send reminder email to each employee
    for (const empId in ticketsByEmployee) {
      const empTickets = ticketsByEmployee[empId];
      const employeeEmail = empTickets[0].assignedTo.email;
      const employeeName = empTickets[0].assignedTo.name;

      const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

      await sendEmail({
        to: employeeEmail,
        subject: `Reminder: You have ${empTickets.length} pending tickets`,
        html: `<p>Hello ${employeeName},</p>
               <p>This is a reminder that you have the following pending tickets:</p>
               <ul>${ticketListHtml}</ul>
               <p>Please resolve them as soon as possible.</p>`
      });
    }
  } catch (error) {
    console.error('Error in reminder job:', error);
  }
});
