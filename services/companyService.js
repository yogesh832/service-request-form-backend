import Company from '../models/Company.js';
import AppError from '../utils/appError.js';

export const createCompany = async (companyData) => {
  return await Company.create(companyData);
};

export const getAllCompanies = async (query) => {
  return await Company.find(query);
};

export const getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError('No company found with that ID', 404);
  }
  return company;
};

export const updateCompany = async (id, updateData) => {
  const company = await Company.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!company) {
    throw new AppError('No company found with that ID', 404);
  }

  return company;
};

export const deleteCompany = async (id) => {
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    throw new AppError('No company found with that ID', 404);
  }
  return company;
};