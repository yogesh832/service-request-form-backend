// services/emailService.js
import nodemailer from "nodemailer";
import {
  welcomeEmail,
  passwordResetEmail,
  ticketCreatedTemplate,
} from "../utils/emailTemplates.js";

// // Ethereal testing SMTP setup
// let testAccount = await nodemailer.createTestAccount(); // 👈 creates test credentials

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "contact.salkatech@gmail.com",
    pass: "ndxwlggpexolbklv",
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `SALKATe <${"contact.salkatech@gmail.com"}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Test email sent: ${info.messageId}`);
    console.log(`📨 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error(`❌ Error sending email:`, error);
  }
};
