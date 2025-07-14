
// import cron from 'node-cron';
// import Ticket from '../models/Ticket.js';
// import { sendEmail } from '../services/emailService.js';

// const supervisorEmail = 'arpitaupadhayay759@gmail.com';
// const directorEmail = 'mr.yashyogesh@gmail.com';

// // Ticket age thresholds in ms
// // const SIX_HOURS = 6 * 60 * 60 * 1000;
// // const NINE_HOURS = 9 * 60 * 60 * 1000;
// const SIX_HOURS = 6 * 60 * 1000; //6 mint for testing
// const NINE_HOURS = 9 * 60 * 1000;


// const runEscalationJob = async () => {
//   console.log("🚀 Running Ticket Escalation Job...");

//   const now = new Date();

//   try {
//     const tickets = await Ticket.find({
//       status: { $in: ['open', 'pending'] },
//       assignedTo: { $ne: null }
//     }).populate('assignedTo user');


//     for (const ticket of tickets) {
//   const age = now - new Date(ticket.createdAt);

//   if (!ticket.assignedTo) {
//     console.warn(`⛔ Skipping ticket ${ticket.ticketNumber} — No assigned engineer.`);
//     continue;
//   }

//   let level = null;
//   let recipient = null;
//   let subject = '';
//   let body = '';
//   const employee = ticket.assignedTo;

//   // if (age >= NINE_HOURS) {
//   //   level = 'L2';
//   //   recipient = directorEmail;
//   //   subject = `🔴 [L2 Escalation] Ticket ${ticket.ticketNumber} Needs Urgent Attention`;
//   //   body = `
//   //     <p>Dear Director,</p>
//   //     <p>The following ticket has not been resolved in over 9 hours:</p>
//   //     <ul>
//   //       <li><strong>Ticket:</strong> ${ticket.ticketNumber}</li>
//   //       <li><strong>Engineer:</strong> ${employee.name}</li>
//   //     </ul>`;
//   // } else if (age >= SIX_HOURS) {
//   //   level = 'L1';
//   //   recipient = supervisorEmail;
//   //   subject = `⚠️ [L1 Escalation] Ticket ${ticket.ticketNumber}`;
//   //   body = `
//   //     <p>Dear Supervisor,</p>
//   //     <p>Ticket needs escalation after 6 hours:</p>
//   //     <ul>
//   //       <li><strong>Ticket:</strong> ${ticket.ticketNumber}</li>
//   //       <li><strong>Engineer:</strong> ${employee.name}</li>
//   //     </ul>`;
//   // } else {
//   //   level = 'L0';
//   //   recipient = employee.email;
//   //   subject = `🕒 Reminder: Ticket ${ticket.ticketNumber}`;
//   //   body = `
//   //     <p>Hello ,</p>
//   //     <p>This is a reminder for ticket:</p>
//   //     <ul>
//   //       <li><strong>Ticket:</strong> ${ticket.ticketNumber}</li>
//   //       <li><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
//   //     </ul>`;
//   // }
//   const ticketViewUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}`;

// if (age >= NINE_HOURS) {
//   level = 'L2';
//   recipient = directorEmail;
//   subject = `🔴 [L2 Escalation] Ticket ${ticket.ticketNumber} Needs Urgent Attention`;
//   body = `
//     <p>Dear Director,</p>
//     <p>The following ticket has not been resolved in over 9 hours:</p>
//     <ul>
//       <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
//       <li><strong>Title:</strong> ${ticket.subject}</li>
//       <li><strong>Engineer:</strong> ${employee.name}</li>
//     </ul>
//     <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #b91c1c; color: white; text-decoration: none; border-radius: 4px;">🚨 View Ticket</a>
//   `;
// } else if (age >= SIX_HOURS) {
//   level = 'L1';
//   recipient = supervisorEmail;
//   subject = `⚠️ [L1 Escalation] Ticket ${ticket.ticketNumber}`;
//   body = `
//     <p>Dear Supervisor,</p>
//     <p>Ticket needs escalation after 6 hours:</p>
//     <ul>
//       <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
//       <li><strong>Title:</strong> ${ticket.subject}</li>
//       <li><strong>Engineer:</strong> ${employee.name}</li>
//     </ul>
//     <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 4px;">⚠️ View Ticket</a>
//   `;
// } else {
//   level = 'L0';
//   recipient = employee.email;
//   subject = `🕒 Reminder: Ticket ${ticket.ticketNumber}`;
//   body = `
//     <p>Hello ${employee.name},</p>
//     <p>This is a reminder for the following ticket:</p>
//     <ul>
//       <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
//       <li><strong>Title:</strong> ${ticket.subject}</li>
//       <li><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
//     </ul>
//     <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px;">📄 View Ticket</a>
//   `;
// }


//    try {
//         await sendEmail({ to: recipient, subject, html: body });
//         console.log(`📧 Email sent for ${ticket.ticketNumber} to ${recipient} [${level}]`);
//       } catch (mailError) {
//         console.error(`❌ Failed to send email for ticket ${ticket.ticketNumber}:`, mailError.message);
//       }

//   console.log(`📧 Email sent for ${ticket.ticketNumber} to ${recipient} [${level}]`);
// }

//   } catch (error) {
//     console.error("❌ Escalation Job Error:", error);
//   }
// };

// // ⏱️ Cron: every 5 minutes for demo; change to every 6 hrs in prod
// cron.schedule('*/60 * * * *', () => {
//   runEscalationJob();
// });
import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js'; // 👈 Import User model
import { sendEmail } from '../services/emailService.js';

// Time thresholds for escalation
const SIX_HOURS = 6 * 60 * 1000;
const NINE_HOURS = 9 * 60 * 1000;

const runEscalationJob = async () => {
  console.log("🚀 Running Ticket Escalation Job...");

  const now = new Date();

  try {
    // 🔍 Get Supervisor & Director from DB
    const [supervisor, director] = await Promise.all([
      User.findOne({ name: "try supervisor" }),
      User.findOne({ name: "try director" }),
    ]);

    if (!supervisor || !director) {
      console.error("❌ Supervisor or Director not found in database.");
      return;
    }

    const tickets = await Ticket.find({
      status: { $in: ['open', 'pending'] },
      assignedTo: { $ne: null }
    }).populate('assignedTo user');

    for (const ticket of tickets) {
      const age = now - new Date(ticket.createdAt);
      const employee = ticket.assignedTo;
      const ticketViewUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}`;

      let level = null;
      let recipient = null;
      let subject = '';
      let body = '';

      if (age >= NINE_HOURS) {
        level = 'L2';
        recipient = director.email;
        subject = `🔴 [L2 Escalation] Ticket ${ticket.ticketNumber} Needs Urgent Attention`;
        body = `
          <p>Dear Director,</p>
          <p>The following ticket has not been resolved in over 9 hours:</p>
          <ul>
            <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.subject}</li>
            <li><strong>Engineer:</strong> ${employee.name}</li>
          </ul>
          <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #b91c1c; color: white; text-decoration: none; border-radius: 4px;">🚨 View Ticket</a>
        `;
      } else if (age >= SIX_HOURS) {
        level = 'L1';
        recipient = supervisor.email;
        subject = `⚠️ [L1 Escalation] Ticket ${ticket.ticketNumber}`;
        body = `
          <p>Dear Supervisor,</p>
          <p>Ticket needs escalation after 6 hours:</p>
          <ul>
            <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.subject}</li>
            <li><strong>Engineer:</strong> ${employee.name}</li>
          </ul>
          <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 4px;">⚠️ View Ticket</a>
        `;
      } else {
        level = 'L0';
        recipient = employee.email;
        subject = `🕒 Reminder: Ticket ${ticket.ticketNumber}`;
        body = `
          <p>Hello ${employee.name},</p>
          <p>This is a reminder for the following ticket:</p>
          <ul>
            <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.subject}</li>
            <li><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
          </ul>
          <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px;">📄 View Ticket</a>
        `;
      }

      try {
        await sendEmail({ to: recipient, subject, html: body });
        console.log(`📧 Email sent for ${ticket.ticketNumber} to ${recipient} [${level}]`);
      } catch (mailError) {
        console.error(`❌ Failed to send email for ticket ${ticket.ticketNumber}:`, mailError.message);
      }
    }
  } catch (error) {
    console.error("❌ Escalation Job Error:", error);
  }
};

// ⏱️ Cron Job (every 2 mins for testing)
cron.schedule('*/2 * * * *', () => {
  runEscalationJob();
});
