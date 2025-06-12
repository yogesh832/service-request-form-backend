import Company from '../models/Company.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin
export const getAllCompanies = async (req, res, next) => {
  try {
    const features = new APIFeatures(Company.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const companies = await features.query;

    res.status(200).json({
      status: 'success',
      results: companies.length,
      data: {
        companies
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Private/Admin
export const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private/Admin
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('No company found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PATCH /api/companies/:id
// @access  Private/Admin
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!company) {
      return next(new AppError('No company found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Admin
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return next(new AppError('No company found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};