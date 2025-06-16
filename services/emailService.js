// // services/emailService.js
// import nodemailer from 'nodemailer';
// import { welcomeEmail, passwordResetEmail } from '../utils/emailTemplates.js';

// // const transporter = nodemailer.createTransport({
// //   host: process.env.EMAIL_HOST,
// //   port: process.env.EMAIL_PORT,
// //   auth: {
// //     user: process.env.EMAIL_USERNAME,
// //     pass: process.env.EMAIL_PASSWORD
// //   }
// // });
// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com", // ✅ string me hona chahiye
//   port: 587,                     // ✅ Brevo supports port 587 (STARTTLS)
//   auth: {
//     user: "8f8cdd001@smtp-brevo.com",
//     pass: "kyb8gqPI0TjHzZV" // ✅ string me hona chahiye
//   },

// });


// export const sendEmail = async ({ email, subject, template, data }) => {
//   let html;
  
//   switch (template) {
//     case 'welcome':
//       html = welcomeEmail(data);
//       break;
//     case 'passwordReset':
//       html = passwordResetEmail(data);
//       break;
//     default:
//       html = '';
//   }

//   const mailOptions = {
//     from: `SupportHub <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject,
//     html
//   };

//   await transporter.sendMail(mailOptions);
// };

import nodemailer from 'nodemailer';
import { welcomeEmail, passwordResetEmail } from '../utils/emailTemplates.js';

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS for port 587
  auth: {
    user: "8f8cdd001@smtp-brevo.com",
    pass: "kyb8gqPI0TjHzZVK"
  },
});

export const sendEmail = async ({ email, subject, template, data }) => {
  let html;

  switch (template) {
    case 'welcome':
      html = welcomeEmail(data);
      break;
    case 'passwordReset':
      html = passwordResetEmail(data);
      break;
    default:
      html = '';
  }

  const mailOptions = {
    from: 'SupportHub <8f8cdd001@smtp-brevo.com>', // Verified sender address
    to: email,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};
