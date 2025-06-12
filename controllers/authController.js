
// ✅ controllers/authController.js
import * as authService from '../services/authService.js';
import { createSendToken } from '../utils/jwtUtils.js';
import { sendEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Welcome to SupportHub',
    //   template: 'welcome',
    //   data: { name: user.name }
    // });
    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { user, resetToken } = await authService.forgotPasswordUser(req.body.email);
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Reset Token',
    //   template: 'passwordReset',
    //   data: { name: user.name, resetURL }
    // });
    console.log(resetURL)
    res.status(200).json({ status: 'success', message: 'Reset token sent!' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await authService.resetPasswordUser(req.params.token, req.body.password);
    createSendToken(user, 200, res);
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
    createSendToken(user, 200, res);
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

