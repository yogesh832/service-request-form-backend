import * as authService from '../services/authService.js';
import { signToken } from '../utils/jwtUtils.js';
import { sendEmail } from '../services/emailService.js';
import { passwordResetEmail , welcomeEmail } from '../utils/emailTemplates.js';

// Helper: send token in cookie + response
const sendAuthToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Cookie settings
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto || null
      }
    }
  });
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    await sendEmail({
      to: user.email,
      subject: `Welcome to Sakla Tech, ${user.name}!`,
      html: welcomeEmail(user.name)
    });

    sendAuthToken(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    sendAuthToken(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { user, resetToken } = await authService.forgotPasswordUser(req.body.email);

    const resetURL = `https://5vwd9w13-5173.inc1.devtunnels.ms/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: passwordResetEmail({ name: user.name, resetURL })
    });

    res.status(200).json({ status: 'success', message: 'Reset token sent!' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await authService.resetPasswordUser(req.params.token, req.body.password);
    sendAuthToken(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const user = await authService.updatePasswordUser(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    sendAuthToken(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};
