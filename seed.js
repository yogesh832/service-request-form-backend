// seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import { dummyCompanies, dummyUsers, dummyTickets } from './dummyData.js';
import Counter from './models/Counter.js';
dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Company.deleteMany();
    await User.deleteMany();
    await Ticket.deleteMany();
    await Counter.deleteMany();
    const createdCompanies = await Company.insertMany(dummyCompanies);
    const createdUsers = await User.insertMany(dummyUsers);

    // Map company names to IDs
    const companyMap = {};
    createdCompanies.forEach(company => {
      companyMap[company.name] = company._id;
    });

    // Map user emails to IDs
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
    });

    // Update tickets with proper references
    const updatedTickets = dummyTickets.map(ticket => ({
      ...ticket,
      company: companyMap[ticket.company],
      user: userMap[ticket.user],
      assignedTo: ticket.assignedTo ? userMap[ticket.assignedTo] : undefined
    }));

    await Ticket.insertMany(updatedTickets);

    console.log('Data imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Company.deleteMany();
    await User.deleteMany();
    await Ticket.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}