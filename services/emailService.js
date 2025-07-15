import nodemailer from "nodemailer";

// Step 1: Create the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false because we're using STARTTLS
  auth: {
    user: "contact.salkatech@gmail.com", // Your Gmail address
    pass: "ndxwlggpexolbklv", // Your App Password (NOT Gmail password)
  },
  tls: {
    rejectUnauthorized: false, // Allow TLS without strict certificate check (for dev)
  },
  connectionTimeout: 10000, // Optional: 10 seconds timeout to avoid hanging
});

// Step 2: Send email function
export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `SALKATECH <contact.salkatech@gmail.com>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
    console.log(`📨 Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`);
    console.error("Error details:", error.message);
  }
};
