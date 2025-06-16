import bcrypt from 'bcrypt';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

export const registerUser = async (userData) => {
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) throw new AppError('User already exists', 400);
  return await User.create(userData);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Incorrect email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Incorrect email or password', 401);

  return user;
};

export const forgotPasswordUser = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('No user with that email', 404);

  const resetToken = Math.random().toString(36).slice(2);
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

export const resetPasswordUser = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Token invalid or expired', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};

export const updatePasswordUser = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);

  user.password = newPassword;
  await user.save();

  return user;
};
