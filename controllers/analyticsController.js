// src/controllers/analyticsController.js
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// @desc    Get resolution times by priority
// @route   GET /api/analytics/priority-resolution-times
// @access  Private/Admin
export const getPriorityResolutionTimes = async (req, res, next) => {
  try {
    // Calculate resolution times for resolved tickets
    const priorityStats = await Ticket.aggregate([
      {
        $match: {
          status: 'resolved'
        }
      },
      {
        $group: {
          _id: '$priority',
          averageTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } },
          minTime: { $min: { $subtract: ['$updatedAt', '$createdAt'] } },
          maxTime: { $max: { $subtract: ['$updatedAt', '$createdAt'] } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          priority: '$_id',
          averageTime: { $divide: ['$averageTime', 1000 * 60 * 60] }, // Convert ms to hours
          minTime: { $divide: ['$minTime', 1000 * 60 * 60] },
          maxTime: { $divide: ['$maxTime', 1000 * 60 * 60] },
          _id: 0
        }
      },
      {
        $sort: { 
          priority: -1 
        }
      }
    ]);

    // Format the results
    const formattedStats = priorityStats.map(stat => ({
      priority: stat.priority,
      averageTime: Number(stat.averageTime.toFixed(1)),
      minTime: Number(stat.minTime.toFixed(1)),
      maxTime: Number(stat.maxTime.toFixed(1))
    }));

    res.status(200).json({
      status: 'success',
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee performance metrics
// @route   GET /api/analytics/employee-performance
// @access  Private/Admin
export const getEmployeePerformance = async (req, res, next) => {
  try {
    // Get all employees
    const employees = await User.find({ role: 'employee' })
      .select('_id name email phone profilePhoto status')
      .lean();

    // Get performance metrics for each employee
    const employeePerformance = await Promise.all(
      employees.map(async (employee) => {
        // Get ticket statistics for this employee
        const stats = await Ticket.aggregate([
          {
            $match: {
              assignedTo: new mongoose.Types.ObjectId(employee._id)
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalTime: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'resolved'] },
                    { $subtract: ['$updatedAt', '$createdAt'] },
                    0
                  ]
                }
              }
            }
          },
          {
            $group: {
              _id: null,
              assignedTickets: { $sum: '$count' },
              resolvedTickets: {
                $sum: {
                  $cond: [{ $eq: ['$_id', 'resolved'] }, '$count', 0]
                }
              },
              totalResolutionTime: { $sum: '$totalTime' }
            }
          }
        ]);

        // Default values if no tickets
        const result = stats[0] || {
          assignedTickets: 0,
          resolvedTickets: 0,
          totalResolutionTime: 0
        };

        return {
          employeeId: employee._id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone || 'N/A',
          profilePhoto: employee.profilePhoto || null,
          status: employee.status || 'active',
          assignedTickets: result.assignedTickets,
          resolvedTickets: result.resolvedTickets,
          averageResolutionTime: result.resolvedTickets > 0 
            ? Number((result.totalResolutionTime / (1000 * 60 * 60 * result.resolvedTickets)).toFixed(1))
            : 0
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: employeePerformance
    });
  } catch (error) {
    next(error);
  }
};