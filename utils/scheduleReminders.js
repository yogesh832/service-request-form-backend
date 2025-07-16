import schedule from "node-schedule";
import { sendEmail } from "../services/emailService.js";
import { generateTicketTable } from "../utils/emailTemplates.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

export const scheduleTicketReminders = async (ticket) => {
  try {
    console.log(`📅 Scheduling unassigned ticket reminders for ${ticket.ticketNumber}`);

    if (ticket.assignedTo) {
      console.log(`✅ Ticket ${ticket.ticketNumber} already assigned. Skipping unassigned reminders.`);
      return;
    }

    const [admin, supervisor, director] = await Promise.all([
      User.findOne({ role: "admin" }),
      User.findOne({ name: "Supervisor" }),
      User.findOne({ name: "Director" }),
    ]);

    const ticketViewUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}`;

    // ⏰ L0 - Reminder to Admin (2 minutes)
    const l0Time = new Date(Date.now() + 2 * 60 * 1000);
    schedule.scheduleJob(l0Time, async () => {
      const latest = await Ticket.findById(ticket._id);
      if (!latest.assignedTo) {
        console.log(`📨 [L0] Reminder to Admin for unassigned ticket ${ticket.ticketNumber}`);
        await sendEmail({
          to: admin.email,
          subject: `🕒 Reminder: Ticket ${ticket.ticketNumber} is still unassigned`,
          html: `
            <p>Hello Admin,</p>
            <p>This ticket has not been assigned to any engineer:</p>
            ${generateTicketTable(ticket)}
            <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 4px;">Assign Ticket</a>
          `,
        });
      }
    });

    // ⏰ L1 - Escalation to Supervisor (4 minutes)
    const l1Time = new Date(Date.now() + 4 * 60 * 1000);
    schedule.scheduleJob(l1Time, async () => {
      const latest = await Ticket.findById(ticket._id);
      if (!latest.assignedTo) {
        console.log(`📨 [L1] Escalation to Supervisor for unassigned ticket ${ticket.ticketNumber}`);
        await sendEmail({
          to: supervisor.email,
          subject: `⚠️ [L1 Escalation] Ticket ${ticket.ticketNumber} is still unassigned`,
          html: `
            <p>Hello Supervisor,</p>
            <p>This ticket is <strong>still unassigned</strong> after 4 minutes:</p>
            ${generateTicketTable(ticket)}
            <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 4px;">Assign Now</a>
          `,
        });
      }
    });

    // ⏰ L2 - Escalation to Director (6 minutes)
    const l2Time = new Date(Date.now() + 6 * 60 * 1000);
    schedule.scheduleJob(l2Time, async () => {
      const latest = await Ticket.findById(ticket._id);
      if (!latest.assignedTo) {
        console.log(`📨 [L2] Escalation to Director for unassigned ticket ${ticket.ticketNumber}`);
        await sendEmail({
          to: director.email,
          subject: `🔴 [L2 Escalation] Ticket ${ticket.ticketNumber} still unassigned`,
          html: `
            <p>Dear Director,</p>
            <p>This ticket has not been assigned to any engineer even after 6 minutes:</p>
            ${generateTicketTable(ticket)}
            <a href="${ticketViewUrl}" style="padding: 10px 15px; background-color: #b91c1c; color: white; text-decoration: none; border-radius: 4px;">🚨 Urgent: Assign Ticket</a>
          `,
        });
      }
    });

    console.log(`✅ All unassigned ticket reminders scheduled for ${ticket.ticketNumber}`);
  } catch (error) {
    console.error(`❌ Failed to schedule unassigned reminders for ${ticket.ticketNumber}:`, error.message);
  }
};
