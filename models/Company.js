// models/Company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  abbreviation: {
    type: String,
    uppercase: true,
    minlength: 3,
    maxlength: 3,
    default: function() {
      // Take first 3 letters of company name
      return this.name.substring(0, 3).toUpperCase();
    }
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  plan: {
    type: String,
    enum: ['Starter', 'Professional', 'Enterprise'],
    default: 'Starter'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});
// Ensure abbreviation is unique
companySchema.pre('save', async function(next) {
  if (!this.isModified('abbreviation')) return next();
  
  const existingCompany = await this.constructor.findOne({ 
    abbreviation: this.abbreviation,
    _id: { $ne: this._id }
  });
  
  if (existingCompany) {
    // If conflict, append number to abbreviation
    let counter = 1;
    while (true) {
      const newAbbr = this.abbreviation.substring(0, 2) + counter;
      const exists = await this.constructor.findOne({ abbreviation: newAbbr });
      if (!exists) {
        this.abbreviation = newAbbr;
        break;
      }
      counter++;
    }
  }
  next();
});

const Company = mongoose.model('Company', companySchema);
export default Company;