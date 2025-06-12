// services/emailService.js
import nodemailer from 'nodemailer';
import { welcomeEmail, passwordResetEmail } from '../utils/emailTemplates.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
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
    from: `SupportHub <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};