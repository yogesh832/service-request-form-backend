// import cron from 'node-cron';
// import Ticket from '../models/Ticket.js';
// import { sendEmail } from '../services/emailService.js';

// let currentLevel = 1; // Start with level 1

// const sendReminderEmails = async (levelLabel) => {
//   console.log(`⏰ Running Level ${levelLabel} reminder job`);

//   try {
//     const tickets = await Ticket.find({
//       status: { $in: ['open', 'pending'] },
//       assignedTo: { $ne: null }
//     }).populate('assignedTo');

//     const ticketsByEmployee = {};

//     tickets.forEach(ticket => {
//       const empId = ticket.assignedTo._id.toString();
//       if (!ticketsByEmployee[empId]) ticketsByEmployee[empId] = [];
//       ticketsByEmployee[empId].push(ticket);
//     });

//     for (const empId in ticketsByEmployee) {
//       const empTickets = ticketsByEmployee[empId];
//       const employeeEmail = empTickets[0].assignedTo.email;
//       const employeeName = empTickets[0].assignedTo.name;

//       const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

//       await sendEmail({
//         to: employeeEmail,
//         subject: `Level ${levelLabel} Reminder: You have ${empTickets.length} pending tickets`,
//         html: `<p>Hello ${employeeName},</p>
//                <p><strong>Level ${levelLabel}</strong> Reminder:</p>
//                <p>You have the following pending tickets:</p>
//                <ul>${ticketListHtml}</ul>
//                <p>Please resolve them as soon as possible.</p>`
//       });
//     }

//   } catch (error) {
//     console.error(`❌ Error in Level ${levelLabel} reminder job:`, error);
//   }
// };

// // 🔄 Har 6 ghante baad chalega, level rotate karega
// cron.schedule('0 */6 * * *', () => {
//   sendReminderEmails(currentLevel);

//   // Rotate: 1 → 2 → 3 → 1 ...
//   currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
// });



import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import { sendEmail } from '../services/emailService.js';

let currentLevel = 1;

// 🔒 Hardcoded escalation emails
const supervisorEmail = 'supervisor@company.com';
const managementEmail = 'management@company.com';

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
      const employee = empTickets[0].assignedTo;

      let toEmail = '';
      let recipientName = '';

      if (levelLabel === 1) {
        toEmail = employee.email;
        recipientName = employee.name;
      } else if (levelLabel === 2) {
        toEmail = supervisorEmail;
        recipientName = `Supervisor of ${employee.name}`;
      } else if (levelLabel === 3) {
        toEmail = managementEmail;
        recipientName = `Management for ${employee.name}`;
      }

      const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

      await sendEmail({
        to: toEmail,
        subject: `Level ${levelLabel} Reminder: ${empTickets.length} pending tickets`,
        html: `
          <p>Hello ${recipientName},</p>
          <p><strong>Level ${levelLabel}</strong> Reminder for tickets assigned to <strong>${employee.name}</strong>:</p>
          <p>Below are the pending tickets:</p>
          <ul>${ticketListHtml}</ul>
          <p>Please ensure they are addressed as soon as possible.</p>`
      });
    }

  } catch (error) {
    console.error(`❌ Error in Level ${levelLabel} reminder job:`, error);
  }
};

// 🔁 Cron job runs every 6 hours and rotates the level
cron.schedule('0 */6 * * *', () => {
  sendReminderEmails(currentLevel);
  currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
});
