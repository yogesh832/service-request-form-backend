// import Ticket from '../models/Ticket.js';
// import User from '../models/User.js';
// import Company from '../models/Company.js';
// import exceljs from 'exceljs';
// import PDFDocument from 'pdfkit';
// import { pipeline } from 'stream';
// import { promisify } from 'util';

// const streamPipeline = promisify(pipeline);

// // Helper to format date
// const formatDate = (date) => {
//   return date ? new Date(date).toISOString().split('T')[0] : 'N/A';
// };

// // Export Users to Excel
// export const exportUsersExcel = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = buildDateQuery(startDate, endDate);
    
//     const users = await User.find(query)
//       .populate('company', 'name')
//       .lean();

//     const usersWithCounts = await addTicketCounts(users);

//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Users');
    
//     // Define columns
//     worksheet.columns = [
//       { header: 'Name', key: 'name', width: 30 },
//       { header: 'Email', key: 'email', width: 30 },
//       { header: 'Phone', key: 'phone', width: 20 },
//       { header: 'Role', key: 'role', width: 15 },
//       { header: 'Company', key: 'companyName', width: 30 },
//       { header: 'Created At', key: 'createdAtFormatted', width: 20 },
//       { header: 'Total Tickets', key: 'totalTickets', width: 15 },
//       { header: 'Tickets Solved', key: 'ticketsSolved', width: 15 }
//     ];

//     // Add data
//     usersWithCounts.forEach(user => {
//       worksheet.addRow({
//         ...user,
//         companyName: user.company?.name || 'N/A',
//         createdAtFormatted: formatDate(user.createdAt)
//       });
//     });

//     // Style header
//     worksheet.getRow(1).eachCell(cell => {
//       cell.font = { bold: true };
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFD9E1F2' }
//       };
//     });

//     // Alternating row colors
//     worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//       if (rowNumber > 1) {
//         row.eachCell(cell => {
//           cell.fill = rowNumber % 2 === 0 
//             ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
//             : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
//         });
//       }
//     });

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=users_export_${Date.now()}.xlsx`
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Export Users to PDF
// export const exportUsersPDF = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = buildDateQuery(startDate, endDate);
    
//     const users = await User.find(query)
//       .populate('company', 'name')
//       .lean();

//     const usersWithCounts = await addTicketCounts(users);
    
//     const doc = new PDFDocument({ margin: 30 });
//     const filename = `users_export_${Date.now()}.pdf`;
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
//     doc.pipe(res);
    
//     // Title
//     doc.fontSize(20).text('User Export Report', { align: 'center' });
//     doc.moveDown();
    
//     // Date range info
//     if (startDate || endDate) {
//       doc.fontSize(12).text(
//         `Date Range: ${startDate ? formatDate(startDate) : 'Start'} - ${endDate ? formatDate(endDate) : 'End'}`,
//         { align: 'center' }
//       );
//       doc.moveDown();
//     }
    
//     // Table headers
//     const headers = ['Name', 'Email', 'Phone', 'Role', 'Company', 'Created', 'Tickets', 'Solved'];
//     const columnWidths = [100, 120, 80, 60, 100, 80, 50, 50];
//     let y = doc.y;
    
//     // Header row
//     doc.font('Helvetica-Bold');
//     headers.forEach((header, i) => {
//       doc.text(header, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
//     });
//     doc.moveDown();
    
//     // Data rows
//     doc.font('Helvetica');
//     usersWithCounts.forEach(user => {
//       y = doc.y;
//       const row = [
//         user.name,
//         user.email,
//         user.phone,
//         user.role,
//         user.company?.name || 'N/A',
//         formatDate(user.createdAt),
//         user.totalTickets.toString(),
//         user.ticketsSolved.toString()
//       ];
      
//       row.forEach((cell, i) => {
//         doc.text(cell, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
//       });
//       doc.moveDown();
//     });
    
//     doc.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Export Tickets to Excel
// export const exportTicketsExcel = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = buildDateQuery(startDate, endDate);
    
//     const tickets = await Ticket.find(query)
//       .populate('user', 'name email')
//       .populate('assignedTo', 'name email')
//       .populate({
//         path: 'assignedTo',
//         populate: { path: 'company', select: 'name' }
//       })
//       .lean();

//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Tickets');
    
//     // Define columns
//     worksheet.columns = [
//       { header: 'Ticket #', key: 'ticketNumber', width: 20 },
//       { header: 'Subject', key: 'subject', width: 40 },
//       { header: 'Description', key: 'description', width: 60 },
//       { header: 'Status', key: 'status', width: 15 },
//       { header: 'Priority', key: 'priority', width: 15 },
//       { header: 'Category', key: 'category', width: 15 },
//       { header: 'Created At', key: 'createdAtFormatted', width: 20 },
//       { header: 'Created By', key: 'createdBy', width: 30 },
//       { header: 'Assigned To', key: 'assignedToName', width: 30 },
//       { header: 'Employee Company', key: 'employeeCompany', width: 30 },
//       { header: 'Phone', key: 'phone', width: 20 },
//       { header: 'Attachments', key: 'attachments', width: 40 }
//     ];

//     // Add data
//     tickets.forEach(ticket => {
//       worksheet.addRow({
//         ...ticket,
//         createdAtFormatted: formatDate(ticket.createdAt),
//         createdBy: ticket.user 
//           ? `${ticket.user.name} (${ticket.user.email})` 
//           : 'N/A',
//         assignedToName: ticket.assignedTo 
//           ? `${ticket.assignedTo.name} (${ticket.assignedTo.email})` 
//           : 'N/A',
//         employeeCompany: ticket.assignedTo?.company?.name || 'N/A',
//         attachments: ticket.attachments 
//           ? ticket.attachments.map(a => a.originalname).join(', ') 
//           : 'None'
//       });
//     });

//     // Apply styles same as users export
//     worksheet.getRow(1).eachCell(cell => {
//       cell.font = { bold: true };
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFD9E1F2' }
//       };
//     });

//     worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//       if (rowNumber > 1) {
//         row.eachCell(cell => {
//           cell.fill = rowNumber % 2 === 0 
//             ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
//             : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
//         });
//       }
//     });

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=tickets_export_${Date.now()}.xlsx`
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Export Tickets to PDF
// export const exportTicketsPDF = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = buildDateQuery(startDate, endDate);
    
//     const tickets = await Ticket.find(query)
//       .populate('user', 'name email')
//       .populate('assignedTo', 'name email')
//       .populate({
//         path: 'assignedTo',
//         populate: { path: 'company', select: 'name' }
//       })
//       .lean();

//     const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
//     const filename = `tickets_export_${Date.now()}.pdf`;
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
//     doc.pipe(res);
    
//     // Title
//     doc.fontSize(20).text('Ticket Export Report', { align: 'center' });
//     doc.moveDown();
    
//     // Date range
//     if (startDate || endDate) {
//       doc.fontSize(12).text(
//         `Date Range: ${startDate ? formatDate(startDate) : 'Start'} - ${endDate ? formatDate(endDate) : 'End'}`,
//         { align: 'center' }
//       );
//       doc.moveDown();
//     }
    
//     // Table headers
//     const headers = [
//       'Ticket #', 'Subject', 'Description', 'Status', 'Priority', 
//       'Category', 'Created', 'Created By', 'Assigned To', 
//       'Emp Company', 'Phone', 'Attachments'
//     ];
    
//     const columnWidths = [60, 80, 100, 40, 40, 40, 60, 90, 90, 70, 60, 80];
//     let y = doc.y;
    
//     // Header row
//     doc.font('Helvetica-Bold');
//     headers.forEach((header, i) => {
//       doc.text(header, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
//     });
//     doc.moveDown();
    
//     // Data rows
//     doc.font('Helvetica').fontSize(10);
//     tickets.forEach(ticket => {
//       y = doc.y;
//       const row = [
//         ticket.ticketNumber,
//         ticket.subject,
//         ticket.description.substring(0, 100) + (ticket.description.length > 100 ? '...' : ''),
//         ticket.status,
//         ticket.priority,
//         ticket.category,
//         formatDate(ticket.createdAt),
//         ticket.user ? `${ticket.user.name}\n${ticket.user.email}` : 'N/A',
//         ticket.assignedTo ? `${ticket.assignedTo.name}\n${ticket.assignedTo.email}` : 'N/A',
//         ticket.assignedTo?.company?.name || 'N/A',
//         ticket.phone || 'N/A',
//         ticket.attachments 
//           ? ticket.attachments.map(a => a.originalname).join(', ') 
//           : 'None'
//       ];
      
//       row.forEach((cell, i) => {
//         doc.text(cell, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
//       });
//       doc.moveDown();
//     });
    
//     doc.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Helper functions
// const buildDateQuery = (startDate, endDate) => {
//   const query = {};
//   if (startDate || endDate) {
//     query.createdAt = {};
//     if (startDate) query.createdAt.$gte = new Date(startDate);
//     if (endDate) query.createdAt.$lte = new Date(endDate);
//   }
//   return query;
// };

// const addTicketCounts = async (users) => {
//   const userIds = users.map(u => u._id);
  
//   const [createdCounts, assignedCounts, resolvedCounts] = await Promise.all([
//     Ticket.aggregate([
//       { $match: { user: { $in: userIds } } },
//       { $group: { _id: '$user', count: { $sum: 1 } } }
//     ]),
//     Ticket.aggregate([
//       { $match: { assignedTo: { $in: userIds } } },
//       { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
//     ]),
//     Ticket.aggregate([
//       { $match: { assignedTo: { $in: userIds }, status: 'resolved' } },
//       { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
//     ])
//   ]);

//   const createdMap = new Map(createdCounts.map(c => [c._id.toString(), c.count]));
//   const assignedMap = new Map(assignedCounts.map(c => [c._id.toString(), c.count]));
//   const resolvedMap = new Map(resolvedCounts.map(c => [c._id.toString(), c.count]));

//   return users.map(user => ({
//     ...user,
//     totalTickets: user.role === 'client' 
//       ? createdMap.get(user._id.toString()) || 0
//       : assignedMap.get(user._id.toString()) || 0,
//     ticketsSolved: user.role === 'employee' 
//       ? resolvedMap.get(user._id.toString()) || 0 
//       : 0
//   }));
// };

import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import exceljs from 'exceljs';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

// Helper to format date
const formatDate = (date) => {
  return date ? format(new Date(date), 'yyyy-MM-dd HH:mm') : 'N/A';
};

// Build date query for filtering
const buildDateQuery = (startDate, endDate) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  return query;
};

// Add ticket counts to users
const addTicketCounts = async (users) => {
  const userIds = users.map(u => u._id);
  
  const [createdCounts, assignedCounts, resolvedCounts] = await Promise.all([
    Ticket.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]),
    Ticket.aggregate([
      { $match: { assignedTo: { $in: userIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]),
    Ticket.aggregate([
      { $match: { assignedTo: { $in: userIds }, status: 'resolved' } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ])
  ]);

  const createdMap = new Map(createdCounts.map(c => [c._id.toString(), c.count]));
  const assignedMap = new Map(assignedCounts.map(c => [c._id.toString(), c.count]));
  const resolvedMap = new Map(resolvedCounts.map(c => [c._id.toString(), c.count]));

  return users.map(user => ({
    ...user,
    totalTickets: user.role === 'client' 
      ? createdMap.get(user._id.toString()) || 0
      : assignedMap.get(user._id.toString()) || 0,
    ticketsSolved: user.role === 'employee' 
      ? resolvedMap.get(user._id.toString()) || 0 
      : 0
  }));
};

// Export Users to Excel
export const exportUsersExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = buildDateQuery(startDate, endDate);
    
    const users = await User.find(query)
      .populate('company', 'name')
      .lean();

    const usersWithCounts = await addTicketCounts(users);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    
    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Company', key: 'companyName', width: 30 },
      { header: 'Created At', key: 'createdAtFormatted', width: 20 },
      { header: 'Total Tickets', key: 'totalTickets', width: 15 },
      { header: 'Tickets Solved', key: 'ticketsSolved', width: 15 }
    ];

    // Add data
    usersWithCounts.forEach(user => {
      worksheet.addRow({
        ...user,
        companyName: user.company?.name || 'N/A',
        createdAtFormatted: formatDate(user.createdAt)
      });
    });

    // Style header
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
      };
    });

    // Alternating row colors
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => {
          cell.fill = rowNumber % 2 === 0 
            ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
            : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users_export_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Users to PDF
export const exportUsersPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = buildDateQuery(startDate, endDate);
    
    const users = await User.find(query)
      .populate('company', 'name')
      .lean();

    const usersWithCounts = await addTicketCounts(users);
    
    const doc = new PDFDocument({ margin: 30 });
    const filename = `users_export_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text('User Export Report', { align: 'center' });
    doc.moveDown();
    
    // Date range info
    if (startDate || endDate) {
      doc.fontSize(12).text(
        `Date Range: ${startDate ? formatDate(startDate) : 'Start'} - ${endDate ? formatDate(endDate) : 'End'}`,
        { align: 'center' }
      );
      doc.moveDown();
    }
    
    // Table headers
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Company', 'Created', 'Tickets', 'Solved'];
    const columnWidths = [100, 120, 80, 60, 100, 80, 50, 50];
    let y = doc.y;
    
    // Header row
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
    doc.moveDown();
    
    // Data rows
    doc.font('Helvetica');
    usersWithCounts.forEach(user => {
      y = doc.y;
      const row = [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.company?.name || 'N/A',
        formatDate(user.createdAt),
        user.totalTickets.toString(),
        user.ticketsSolved.toString()
      ];
      
      row.forEach((cell, i) => {
        doc.text(cell, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      doc.moveDown();
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Tickets to Excel
export const exportTicketsExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = buildDateQuery(startDate, endDate);
    
    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'assignedTo',
        populate: { path: 'company', select: 'name' }
      })
      .lean();

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');
    
    // Define columns
    worksheet.columns = [
      { header: 'Ticket #', key: 'ticketNumber', width: 20 },
      { header: 'Subject', key: 'subject', width: 40 },
      { header: 'Description', key: 'description', width: 60 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Created At', key: 'createdAtFormatted', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 30 },
      { header: 'Assigned To', key: 'assignedToName', width: 30 },
      { header: 'Employee Company', key: 'employeeCompany', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Attachments', key: 'attachments', width: 40 }
    ];

    // Add data
    tickets.forEach(ticket => {
      worksheet.addRow({
        ...ticket,
        createdAtFormatted: formatDate(ticket.createdAt),
        createdBy: ticket.user 
          ? `${ticket.user.name} (${ticket.user.email})` 
          : 'N/A',
        assignedToName: ticket.assignedTo 
          ? `${ticket.assignedTo.name} (${ticket.assignedTo.email})` 
          : 'N/A',
        employeeCompany: ticket.assignedTo?.company?.name || 'N/A',
        attachments: ticket.attachments 
          ? ticket.attachments.map(a => a.originalname).join(', ') 
          : 'None'
      });
    });

    // Apply styles
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
      };
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => {
          cell.fill = rowNumber % 2 === 0 
            ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
            : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tickets_export_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Tickets to PDF
export const exportTicketsPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = buildDateQuery(startDate, endDate);
    
    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'assignedTo',
        populate: { path: 'company', select: 'name' }
      })
      .lean();

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const filename = `tickets_export_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text('Ticket Export Report', { align: 'center' });
    doc.moveDown();
    
    // Date range
    if (startDate || endDate) {
      doc.fontSize(12).text(
        `Date Range: ${startDate ? formatDate(startDate) : 'Start'} - ${endDate ? formatDate(endDate) : 'End'}`,
        { align: 'center' }
      );
      doc.moveDown();
    }
    
    // Table headers
    const headers = [
      'Ticket #', 'Subject', 'Description', 'Status', 'Priority', 
      'Category', 'Created', 'Created By', 'Assigned To', 
      'Emp Company', 'Phone', 'Attachments'
    ];
    
    const columnWidths = [60, 80, 100, 40, 40, 40, 60, 90, 90, 70, 60, 80];
    let y = doc.y;
    
    // Header row
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
    doc.moveDown();
    
    // Data rows
    doc.font('Helvetica').fontSize(10);
    tickets.forEach(ticket => {
      y = doc.y;
      const row = [
        ticket.ticketNumber,
        ticket.subject,
        ticket.description.substring(0, 100) + (ticket.description.length > 100 ? '...' : ''),
        ticket.status,
        ticket.priority,
        ticket.category,
        formatDate(ticket.createdAt),
        ticket.user ? `${ticket.user.name}\n${ticket.user.email}` : 'N/A',
        ticket.assignedTo ? `${ticket.assignedTo.name}\n${ticket.assignedTo.email}` : 'N/A',
        ticket.assignedTo?.company?.name || 'N/A',
        ticket.phone || 'N/A',
        ticket.attachments 
          ? ticket.attachments.map(a => a.originalname).join(', ') 
          : 'None'
      ];
      
      row.forEach((cell, i) => {
        doc.text(cell, 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      doc.moveDown();
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};