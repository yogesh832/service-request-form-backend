// // import cron from 'node-cron';
// // import Ticket from '../models/Ticket.js';
// // import { sendEmail } from '../services/emailService.js';

// // let currentLevel = 1; // Start with level 1

// // const sendReminderEmails = async (levelLabel) => {
// //   console.log(`⏰ Running Level ${levelLabel} reminder job`);

// //   try {
// //     const tickets = await Ticket.find({
// //       status: { $in: ['open', 'pending'] },
// //       assignedTo: { $ne: null }
// //     }).populate('assignedTo');

// //     const ticketsByEmployee = {};

// //     tickets.forEach(ticket => {
// //       const empId = ticket.assignedTo._id.toString();
// //       if (!ticketsByEmployee[empId]) ticketsByEmployee[empId] = [];
// //       ticketsByEmployee[empId].push(ticket);
// //     });

// //     for (const empId in ticketsByEmployee) {
// //       const empTickets = ticketsByEmployee[empId];
// //       const employeeEmail = empTickets[0].assignedTo.email;
// //       const employeeName = empTickets[0].assignedTo.name;

// //       const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

// //       await sendEmail({
// //         to: employeeEmail,
// //         subject: `Level ${levelLabel} Reminder: You have ${empTickets.length} pending tickets`,
// //         html: `<p>Hello ${employeeName},</p>
// //                <p><strong>Level ${levelLabel}</strong> Reminder:</p>
// //                <p>You have the following pending tickets:</p>
// //                <ul>${ticketListHtml}</ul>
// //                <p>Please resolve them as soon as possible.</p>`
// //       });
// //     }

// //   } catch (error) {
// //     console.error(`❌ Error in Level ${levelLabel} reminder job:`, error);
// //   }
// // };

// // // 🔄 Har 6 ghante baad chalega, level rotate karega
// // cron.schedule('0 */6 * * *', () => {
// //   sendReminderEmails(currentLevel);

// //   // Rotate: 1 → 2 → 3 → 1 ...
// //   currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
// // });



// import cron from 'node-cron';
// import Ticket from '../models/Ticket.js';
// import { sendEmail } from '../services/emailService.js';

// let currentLevel = 1;

// // 🔒 Hardcoded escalation emails
// const supervisorEmail = 'supervisor@company.com';
// const managementEmail = 'management@company.com';

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
//       const employee = empTickets[0].assignedTo;

//       let toEmail = '';
//       let recipientName = '';

//       if (levelLabel === 1) {
//         toEmail = employee.email;
//         recipientName = employee.name;
//       } else if (levelLabel === 2) {
//         toEmail = supervisorEmail;
//         recipientName = `Supervisor of ${employee.name}`;
//       } else if (levelLabel === 3) {
//         toEmail = managementEmail;
//         recipientName = `Management for ${employee.name}`;
//       }

//       const ticketListHtml = empTickets.map(t => `<li>${t.ticketNumber} - ${t.subject}</li>`).join('');

//       await sendEmail({
//         to: toEmail,
//         subject: `Level ${levelLabel} Reminder: ${empTickets.length} pending tickets`,
//         html: `
//           <p>Hello ${recipientName},</p>
//           <p><strong>Level ${levelLabel}</strong> Reminder for tickets assigned to <strong>${employee.name}</strong>:</p>
//           <p>Below are the pending tickets:</p>
//           <ul>${ticketListHtml}</ul>
//           <p>Please ensure they are addressed as soon as possible.</p>`
//       });
//     }

//   } catch (error) {
//     console.error(`❌ Error in Level ${levelLabel} reminder job:`, error);
//   }
// };

// // 🔁 Cron job runs every 6 hours and rotates the level
// // cron.schedule('0 */6 * * *', () => {
// //   sendReminderEmails(currentLevel);
// //   currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
// // });

// cron.schedule('*/5 * * * *', () => {
//   sendReminderEmails(currentLevel);
//   currentLevel = currentLevel === 3 ? 1 : currentLevel + 1;
// });

import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import { sendEmail } from '../services/emailService.js';

const supervisorEmail = 'Upadhayayyogesh832@gmail.com';
const directorEmail = 'Upadhayayyogesh832@gmail.com';

// Ticket age thresholds in ms
const SIX_HOURS = 6 * 60 * 60 * 1000;
const NINE_HOURS = 9 * 60 * 60 * 1000;

const runEscalationJob = async () => {
  console.log("🚀 Running Ticket Escalation Job...");

  const now = new Date();

  try {
    const tickets = await Ticket.find({
      status: { $in: ['open', 'pending'] },
      assignedTo: { $ne: null }
    }).populate('assignedTo user');

    for (const ticket of tickets) {
      const age = now - new Date(ticket.createdAt);

      let level = null;
      let recipient = null;
      let subject = '';
      let body = '';

      // Determine escalation level
      if (age >= NINE_HOURS) {
        level = 'L2';
        recipient = directorEmail;
        subject = `🔴 [L2 Escalation] Ticket ${ticket.ticketNumber} Needs Urgent Attention`;
        body = `
          <p>Dear Director,</p>
          <p>The following ticket has not been resolved in over 9 hours and is escalated to Level 2.</p>
          <ul>
            <li><strong>Ticket:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Subject:</strong> ${ticket.subject}</li>
            <li><strong>Assigned Engineer:</strong> ${ticket.assignedTo.name}</li>
            <li><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
          </ul>
          <p>Please intervene immediately.</p>`;
      } else if (age >= SIX_HOURS) {
        level = 'L1';
        recipient = supervisorEmail;
        subject = `⚠️ [L1 Escalation] Ticket ${ticket.ticketNumber} Needs Supervisor Attention`;
        body = `
          <p>Dear Supervisor,</p>
          <p>The following ticket has not been resolved in over 6 hours and is escalated to Level 1.</p>
          <ul>
            <li><strong>Ticket:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Subject:</strong> ${ticket.subject}</li>
            <li><strong>Assigned Engineer:</strong> ${ticket.assignedTo.name}</li>
            <li><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
          </ul>
          <p>Please take action now.</p>`;
      } else {
        // Immediate alert to assigned engineer (L0)
        level = 'L0';
        recipient = ticket.assignedTo.email;
        subject = `🕒 Reminder: Ticket ${ticket.ticketNumber} is pending`;
        body = `
          <p>Dear ${ticket.assignedTo.name},</p>
          <p>This is a reminder that ticket <strong>${ticket.ticketNumber}</strong> is still open.</p>
          <ul>
            <li><strong>Subject:</strong> ${ticket.subject}</li>
            <li><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
          </ul>
          <p>Please resolve it as soon as possible.</p>`;
      }

      await sendEmail({
        to: recipient,
        subject,
        html: body
      });

      console.log(`📧 Escalation (${level}) email sent for ticket: ${ticket.ticketNumber}`);
    }
  } catch (error) {
    console.error("❌ Escalation Job Error:", error);
  }
};

// ⏱️ Cron: every 5 minutes for demo; change to every 6 hrs in prod
cron.schedule('*/5 * * * *', () => {
  runEscalationJob();
});
