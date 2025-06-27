export const welcomeEmail = ({ name }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        color: #4b0082;
        margin-bottom: 20px;
      }
      .content {
        font-size: 16px;
        line-height: 1.8;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.85em;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🌟 Welcome to SALKATECH!</div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>We're thrilled to have you onboard. Your journey with <strong>SALKATECH</strong> starts now!</p>
        <p>Log in to explore the dashboard and manage your support tickets efficiently.</p>
        <p>If you have any questions, our support team is always here to help.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} SALKATECH. All rights reserved.
      </div>
    </div>
  </body>
  </html>
`;

export const passwordResetEmail = ({ name, resetURL }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        font-size: 26px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #800080;
      }
      .content {
        font-size: 16px;
        line-height: 1.7;
      }
      .button {
        display: inline-block;
        margin: 20px 0;
        background: #4caf50;
        color: #fff;
        padding: 12px 24px;
        text-decoration: none;
        font-weight: bold;
        border-radius: 6px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }
      .button:hover {
        background: #45a049;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.85em;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🔐 Password Reset</div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <p><a href="${resetURL}" class="button">Reset Password</a></p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} SALKATECH. All rights reserved.
      </div>
    </div>
  </body>
  </html>
`;






export const ticketCreatedTemplate = (ticket, origin)=> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 650px;
          margin: 40px auto;
          padding: 30px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        h2 {
          text-align: center;
          color: #4b0082;
          margin-bottom: 24px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 10px 15px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777;
          margin-top: 30px;
        }
        hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎫 Ticket Created - ${ticket.ticketNumber}</h2>

        <p>Hello <strong>${ticket.user.name}</strong>,</p>
        <p>Thank you for contacting <strong>SALKATECH</strong> support. Your ticket has been successfully created. Here are the details:</p>

        <table>
          <tr><td><strong>Ticket Number</strong></td><td>${
            ticket.ticketNumber
          }</td></tr>
          <tr><td><strong>Subject</strong></td><td>${ticket.subject}</td></tr>
          <tr><td><strong>Description</strong></td><td>${
            ticket.description
          }</td></tr>
          <tr><td><strong>Category</strong></td><td>${ticket.category}</td></tr>
          <tr><td><strong>Priority</strong></td><td>${ticket.priority}</td></tr>
          <tr><td><strong>Status</strong></td><td>${ticket.status}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${ticket.phone}</td></tr>
          <tr><td><strong>Created At</strong></td><td>${new Date(
            ticket.createdAt
          ).toLocaleString()}</td></tr>
          ${
            ticket.attachments?.length
              ? `<tr><td><strong>Attachments</strong></td><td>${ticket.attachments
                  .map((att) => att.originalname)
                  .join(", ")}</td></tr>`
              : ""
          }
        </table>
        <p style="margin-top: 20px;">
  You can view your ticket here: 
  <a href="${origin}/tickets/${ticket._id}" target="_blank" style="color:#4b0082;">View Ticket</a>
</p>


        <p style="margin-top: 20px;">Our team will review your request and respond shortly.</p>

        <hr />


        <div class="footer">
          This is an automated email from <strong>SALKATECH</strong>. Please do not reply to this message.
        </div>
      </div>
    </body>
    </html>
  `;
};

export const ticketReminderTemplate = (employeeName, tickets) => {
  const ticketListHtml = tickets
    .map(
      (ticket) =>
        `<li><strong>${ticket.ticketNumber}</strong>: ${ticket.subject} (Status: ${ticket.status})</li>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007bff;">Hello ${employeeName},</h2>
      <p>You have <strong>${tickets.length}</strong> pending/open tickets assigned to you. Please review and resolve them as soon as possible.</p>
      <ul>
        ${ticketListHtml}
      </ul>
      <p>Thank you for your attention to these tickets.</p>
<<<<<<< HEAD
      <p>Best regards,<br/>SALKATech Support Team</p>
=======
      <p>Best regards,<br/>SalkaTech Support Team</p>
>>>>>>> 6fb949ee58e738c7f1cc04b19d48629f2f01afe9
    </div>
  `;
};
