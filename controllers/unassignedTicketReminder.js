import cron from "node-cron";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { generateTicketTable } from "../utils/emailTemplates.js";

// const ONE_HOUR = 60 * 60 * 1000;
const ONE_HOUR = 2 * 60 * 1000; // 5 minutes

const runUnassignedTicketJob = async () => {
  console.log("🕒 Running Unassigned Ticket Checker...");

  try {
    const now = new Date();

    const tickets = await Ticket.find({
      assignedTo: null,
      status: { $in: ["open", "pending"] },
    }).populate("user company");

    if (!tickets.length) {
      console.log("✅ No unassigned tickets found.");
      return;
    }

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ Admin user not found.");
      return;
    }

    for (const ticket of tickets) {
      const elapsed = now - new Date(ticket.createdAt);
      const minutesElapsed = Math.floor(elapsed / 60000);

      console.log(
        `⏳ Ticket ${ticket.ticketNumber} is unassigned for ${minutesElapsed} mins.`
      );

      if (elapsed >= ONE_HOUR) {
        const ticketUrl = `https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}`;

        await sendEmail({
          to: admin.email,
          subject: `🚨 Ticket ${ticket.ticketNumber} is Still Unassigned`,
          html: `
            <p>Dear Admin,</p>
            <p>The following ticket is <strong>unassigned </strong> Till Now</p>
            <ul>
              <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
              <li><strong>Subject:</strong> ${ticket.subject}</li>
              <li><strong>Priority:</strong> ${ticket.priority}</li>
              <li><strong>Status:</strong> ${ticket.status}</li>
              <li><strong>Created At:</strong> ${new Date(
                ticket.createdAt
              ).toLocaleString()}</li>
            </ul>
            ${generateTicketTable(ticket)}
            <a href="${ticketUrl}" style="padding: 10px 15px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px;">🛠️ Assign Now</a>
          `,
        });

        console.log(`📧 Reminder sent for ${ticket.ticketNumber}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in unassigned ticket job:", err.message);
  }
};

// ⏱️ Run every 2 minutes
cron.schedule("*/2 * * * *", runUnassignedTicketJob);
