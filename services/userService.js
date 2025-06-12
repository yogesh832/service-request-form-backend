import User from '../models/User.js';
import AppError from '../utils/appError.js';

export const getAllUsers = async (query) => {
  return await User.find(query).select('-password');
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
  return user;
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
  return user;
};

export const getCurrentUser = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
  return user;
};

export const updateCurrentUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return user;
};