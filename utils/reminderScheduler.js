import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import { sendEmail } from '../services/emailService.js';

let currentLevel = 1; // Start with level 1

const sendReminderEmails = async (levelLabel) => {
  console.log(`⏰ Running Level ${levelLabel} reminder job`);

  try {
    const tickets = await Ticket.find({
      status: { $in: ['open', 'pending'] },
      assignedTo: { $ne: null }
    }).populate('assignedTo');

    const ticketsByEmployee = {};

    tickets.forEach(ticket => {
      const empId = ticket.assignedTo._id.toString();
      if (!ticketsByEmployee[empId]) ticketsByEmployee[empId] = [];
      ticketsByEmployee[empId].push(ticket);
    });

    for (const empId in ticketsByEmployee) {
      const empTickets = ticketsByEmployee[empId];
      const employeeEmail = empTickets[0].assignedTo.email;
      const employeeName = empTickets[0].assignedTo.name;

      const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

      await sendEmail({
        to: employeeEmail,
        subject: `Level ${levelLabel} Reminder: You have ${empTickets.length} pending tickets`,
        html: `<p>Hello ${employeeName},</p>
               <p><strong>Level ${levelLabel}</strong> Reminder:</p>
               <p>You have the following pending tickets:</p>
               <ul>${ticketListHtml}</ul>
               <p>Please resolve them as soon as possible.</p>`
      });
    }

  } catch (error) {
    console.error(`❌ Error in Level ${levelLabel} reminder job:`, error);
  }
};

// 🔄 Har 6 ghante baad chalega, level rotate karega
cron.schedule('0 */6 * * *', () => {
  sendReminderEmails(currentLevel);

  // Rotate: 1 → 2 → 3 → 1 ...
  currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
});
