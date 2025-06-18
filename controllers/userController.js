import User from '../models/User.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query.select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'company',
        select: 'name' // Sirf name chahiye to select use karo
      });

    console.log('Current user:', user);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update current user
// @route   PATCH /api/users/me
// @access  Private
// Add to updateMe controller
// ... existing imports ...
export const updateMe = async (req, res, next) => {
  try {
    console.log('Request body:', req.body.name); // Log the body
    console.log('Request file:', req.file); // Log the file

    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;
    if (req.body.phone) filteredBody.phone = req.body.phone;
    if (req.body.about) filteredBody.about = req.body.about;

    if (req.file && req.file.path) {
      filteredBody.profilePhoto = req.file.path;
      console.log('Profile photo path:', filteredBody.profilePhoto);
    }
   


    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('UpdateMe error:', error); // Detailed error logging
    next(error);
  }
};

// ... other functions remain unchanged ...

// userController.js
export const getEmployees = async (req, res) => {
  try {
    // Maan ke user model me role field hai jisme 'employee' store hota hai
    const employees = await User.find({ role: 'employee' });
    res.status(200).json({
      status: 'success',
      results: employees.length,
      data: { employees }
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

