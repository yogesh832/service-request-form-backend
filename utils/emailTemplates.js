export const welcomeEmail = ({ name }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
      .content { padding: 20px; }
      .footer { margin-top: 20px; font-size: 0.8em; text-align: center; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to SALKA TECH!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for registering with SALKA TECH. We're excited to have you on board!</p>
        <p>You can now log in to your account and start managing your support tickets.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SALKA TECH. All rights reserved.</p>
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
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
      .content { padding: 20px; }
      .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      .footer { margin-top: 20px; font-size: 0.8em; text-align: center; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetURL}" class="button">Reset Password</a></p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>This link is valid for 10 minutes only.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SALKA TECH. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;