export const welcomeEmail = ({ name, email, password }) => `
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
      .info-box {
        margin-top: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 8px;
        font-family: monospace;
      }
      a.reset-link {
        display: inline-block;
        margin-top: 20px;
        padding: 8px 15px;
        background-color: #4b0082;
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
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
        <p>We're excited to welcome you to <strong>SALKATECH</strong>!</p>
        <p><strong>Your login details:</strong></p>

        <div class="info-box">
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>Password:</strong> ${password}</div>
        </div>

        <p>You can change your password anytime after logging in.</p>
        <a href="https://salka-tech-service-request-form.vercel.app/forgot-password" class="reset-link">Reset Your Password</a>

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
        <p>Thank you for contacting <strong>SALKATECH</strong> support.  Ticket created successfully we will revert you soon and  Here are the Ticket details:</p>

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
  You can view Ticket here: 
  <a href="https://salka-tech-service-request-form.vercel.app/tickets/${ticket._id}" target="_blank" style="color:#4b0082;">View Ticket</a>
</p>


        <p style="margin-top: 20px;">Our team will review request and respond shortly.</p>

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
      <p>Thank you for attention to these tickets.</p>
      <p>Best regards,<br/>SALKATECH Support Team</p>
      <p>Best regards,<br/>SALKATECH Support Team</p>
    </div>
  `;
};


export const ticketResolvedTemplate = ({ name, ticketNumber, subject, resolvedAt }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: green;">🎉  Ticket Has Been Resolved!</h2>
    <p>Hi ,</p>
    <p>We are happy to inform you that  ticket has been marked as <strong>Resolved</strong>.</p>

    <ul style="background: #f4f4f4; padding: 10px; border-radius: 6px;">
      <li><strong>Ticket Number:</strong> ${ticketNumber}</li>
      <li><strong>Subject:</strong> ${subject}</li>
      <li><strong>Resolved At:</strong> ${new Date(resolvedAt).toLocaleString()}</li>
    </ul>

    <p>If you believe the issue is not completely resolved, feel free to reopen the ticket or reply to this mail.</p>

    <p>Thanks,<br/>SALKATECH Support Team</p>
  </div>
`;
