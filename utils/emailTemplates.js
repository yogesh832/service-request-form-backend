export const welcomeEmail = ({ name }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #667eea, #764ba2, #ff6a00);
        background-size: 400% 400%;
        animation: gradientMove 15s ease infinite;
      }
      @keyframes gradientMove {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 30px;
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        color: #fff;
      }
      .header {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
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
        color: rgba(255, 255, 255, 0.6);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🌟 Welcome to SALKA TECH!</div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>We're thrilled to have you onboard. Your journey with <strong>SALKA TECH</strong> starts now!</p>
        <p>Log in to explore the dashboard and manage your support tickets efficiently.</p>
        <p>If you have any questions, our support team is always here to help.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} SALKA TECH. All rights reserved.
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
        background: linear-gradient(135deg, #1f005c, #5b0060, #870160, #ac255e, #ca485c);
        background-size: 400% 400%;
        animation: gradientShift 20s ease infinite;
      }
      @keyframes gradientShift {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 20px;
        padding: 30px;
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        color: #fff;
      }
      .header {
        text-align: center;
        font-size: 26px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #ffd6ff;
      }
      .content {
        font-size: 16px;
        line-height: 1.7;
      }
      .button {
        display: inline-block;
        margin: 20px 0;
        background: linear-gradient(to right, #00c9ff, #92fe9d);
        padding: 12px 24px;
        text-decoration: none;
        color: #000;
        font-weight: bold;
        border-radius: 30px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease;
      }
      .button:hover {
        transform: translateY(-2px);
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.85em;
        color: rgba(255, 255, 255, 0.6);
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
        © ${new Date().getFullYear()} SALKA TECH. All rights reserved.
      </div>
    </div>
  </body>
  </html>
`;





export const ticketCreatedTemplate = (ticket) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(120deg, #1e1e2f, #3a2a60, #1e2e43);
          background-size: 200% 200%;
          animation: auroraFlow 15s ease infinite;
          color: #ffffff;
        }

        @keyframes auroraFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .container {
          max-width: 700px;
          margin: 40px auto;
          padding: 35px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
                      inset 0 5px 10px rgba(255, 255, 255, 0.05),
                      inset 0 -5px 10px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(14px);
        }

        h2 {
          text-align: center;
          font-size: 28px;
          margin-bottom: 24px;
          background: linear-gradient(to right, #00f7ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .highlight {
          background: linear-gradient(45deg, #fcb045, #fd1d1d, #833ab4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 20px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.2);
        }

        td {
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(255, 255, 255, 0.05);
        }

        tr:nth-child(even) td {
          background-color: rgba(255, 255, 255, 0.08);
        }

        p {
          margin: 14px 0;
          line-height: 1.6;
        }

        .footer {
          font-size: 12px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 30px;
        }

        hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          margin: 30px 0;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(to right, #ff416c, #ff4b2b);
          padding: 12px 24px;
          border-radius: 25px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎫 Ticket Created - <span class="highlight">${ticket.ticketNumber}</span></h2>

        <p>Hello <strong>${ticket.user.name}</strong>,</p>
        <p>Thank you for contacting <strong>SALKA TECH</strong> support. Your ticket has been successfully created. Please find the details below:</p>

        <table>
          <tr><td><strong>Ticket Number</strong></td><td>${ticket.ticketNumber}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${ticket.subject}</td></tr>
          <tr><td><strong>Description</strong></td><td>${ticket.description}</td></tr>
          <tr><td><strong>Category</strong></td><td>${ticket.category}</td></tr>
          <tr><td><strong>Priority</strong></td><td>${ticket.priority}</td></tr>
          <tr><td><strong>Status</strong></td><td>${ticket.status}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${ticket.phone}</td></tr>
          <tr><td><strong>Created At</strong></td><td>${new Date(ticket.createdAt).toLocaleString()}</td></tr>
          ${
            ticket.attachments?.length
              ? `<tr><td><strong>Attachments</strong></td><td>${ticket.attachments.map(att => att.originalname).join(', ')}</td></tr>`
              : ''
          }
        </table>

        <p style="margin-top: 20px;">Our team will review your request and respond as soon as possible. You can track this ticket in your dashboard.</p>

        <a href="https://yourdomain.com/dashboard/tickets/${ticket._id}" class="cta-button">View Ticket</a>

        <hr />

        <div class="footer">
          This is an automated message from <strong>SALKA TECH</strong>. Please do not reply directly to this email.<br />
          &copy; ${new Date().getFullYear()} SALKA TECH. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
};
