// // controllers/exportController.js
// import User from '../models/User.js';
// import Ticket from '../models/Ticket.js';
// import Company from '../models/Company.js';
// import ExcelJS from 'exceljs';
// import PDFDocument from 'pdfkit';
// import { format } from 'date-fns';
// import AppError from '../utils/appError.js';

// const formatDateForFilename = (date) => format(date, 'yyyy-MM-dd_HH-mm-ss');
// const formatDateForDisplay = (date) => format(date, 'dd MMM yyyy');

// const cleanUser = (user) => ({
//   Name: user.name,
//   Email: user.email,
//   Phone: user.phone || '-',
// });

// const cleanCompany = (company) => ({
//   CompanyName: company.name,
//   Abbreviation: company.abbreviation,
//   Contact: company.contact,
//   Email: company.email,
//   Plan: company.plan,
// });

// const cleanTicket = (ticket) => {
//   // Format attachments as filenames joined by commas or "-"
//   const attachments = ticket.attachments?.length
//     ? ticket.attachments.map(att => att.originalname).join(', ')
//     : '-';

//   return {
//     TicketNumber: ticket.ticketNumber,
//     Subject: ticket.subject,
//     Description: ticket.description,
//     Priority: ticket.priority,
//     Category: ticket.category,
//     Status: ticket.status,
//     CreatedAt: formatDateForDisplay(ticket.createdAt),
//     ResolvedAt: ticket.resolvedAt ? formatDateForDisplay(ticket.resolvedAt) : '-',
//     Client: ticket.user ? ticket.user.name : '-',
//     ClientEmail: ticket.user ? ticket.user.email : '-',
//     ClientPhone: ticket.user ? ticket.user.phone : '-',
//     Company: ticket.company ? ticket.company.name : '-',
//     AssignedTo: ticket.assignedTo ? ticket.assignedTo.name : '-',
//     AssignedEmail: ticket.assignedTo ? ticket.assignedTo.email : '-',
//     AssignedPhone: ticket.assignedTo ? ticket.assignedTo.phone : '-',
//     Attachments: attachments,
//   };
// };

// const getModel = (resource) => {
//   switch (resource) {
//     case 'users': return User;
//     case 'tickets': return Ticket;
//     case 'companies': return Company;
//     default: throw new AppError('Invalid resource', 400);
//   }
// };

// const exportExcel = async (res, resource, data) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet(`${resource.toUpperCase()} Report`);

//   if (!data.length) throw new AppError('No data to export', 404);

//   // Clean and map data
//   let cleanData = [];
//   if (resource === 'tickets') {
//     cleanData = data.map(cleanTicket);
//   } else if (resource === 'users') {
//     cleanData = data.map(cleanUser);
//   } else if (resource === 'companies') {
//     cleanData = data.map(cleanCompany);
//   }

//   // Set headers
//   worksheet.columns = Object.keys(cleanData[0]).map((key) => ({
//     header: key,
//     key,
//     width: 25,
//   }));

//   // Add rows
//   cleanData.forEach(item => worksheet.addRow(item));

//   // Styling header row bold
//   worksheet.getRow(1).font = { bold: true };

//   res.setHeader(
//     'Content-Type',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//   );
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename=${resource}_${formatDateForFilename(new Date())}.xlsx`
//   );

//   await workbook.xlsx.write(res);
//   res.end();
// };

// const exportPdf = (res, resource, data) => {
//   if (!data.length) throw new AppError('No data to export', 404);

//   const doc = new PDFDocument({ margin: 30, size: 'A4' });
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename=${resource}_${formatDateForFilename(new Date())}.pdf`
//   );
//   doc.pipe(res);


//   try {
//     const imagePath = path.join(process.cwd(), 'assets', 'salkatech-banner.png');
//     doc.image(imagePath, {
//       fit: [500, 80],
//       align: 'center',
//       valign: 'top',
//     });
//   } catch (err) {
//     console.error('Failed to load image:', err.message);
//   }

// doc
//   .fillColor('#32CD32') // Light green (you can also try '#90EE90')
//   .fontSize(20)
//   .text('SalkaTech Export Report', { align: 'center' })
//   .fillColor('black'); // Set back to black for rest of the text

// // const reportTitle = 'SalkaTech Export Report';
// // const titleWidth = doc.widthOfString(reportTitle, { font: 'Helvetica-Bold', size: 20 });
// // const pageWidth = doc.page.width;
// // const marginLeft = (pageWidth - titleWidth) / 2;

// // doc
// //   .font('Helvetica-Bold')
// //   .fontSize(20)
// //   .fillColor('#32CD32')
// //   .text('SalkaTech', marginLeft, doc.y, { continued: true })
// //   .fillColor('black')
// //   .text(' Export Report');

//   doc.moveDown();
//   doc.fontSize(16).text(`Resource: ${resource.toUpperCase()}`, { align: 'center' });
//   doc.fontSize(12).text(`Generated at: ${formatDateForFilename(new Date())}`, {
//     align: 'center',
//   });
//   doc.moveDown();

//   let cleanData = [];
//   if (resource === 'tickets') {
//     cleanData = data.map(cleanTicket);
//   } else if (resource === 'users') {
//     cleanData = data.map(cleanUser);
//   } else if (resource === 'companies') {
//     cleanData = data.map(cleanCompany);
//   }

//   cleanData.forEach((item, index) => {
//     doc.fontSize(14).fillColor('blue').text(`#${index + 1}`, { underline: true });
//     doc.moveDown(0.3);

//     Object.entries(item).forEach(([key, value]) => {
//       doc
//         .font('Helvetica-Bold')
//         .fontSize(11)
//         .fillColor('black')
//         .text(`${key}: `, { continued: true });
//       doc.font('Helvetica').text(value);
//     });

//     doc.moveDown();
//   });

//   doc.end();
// };

// export const exportResource = async (req, res, next) => {
//   try {
//     const { resource, format } = req.params;
//     const { startDate, endDate, preview } = req.query;

//     const Model = getModel(resource);

//     const query = {};
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0); // start of day
//         query.createdAt.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999); // end of day
//         query.createdAt.$lte = end;
//       }
//     }

//     let data = await Model.find(query)
//       .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
//       .exec();

//     if (data.length === 0) {
//       return next(new AppError('No data found for export in the given date range', 404));
//     }

//     if (format === 'xlsx') return await exportExcel(res, resource, data);
//     if (format === 'pdf') return exportPdf(res, resource, data);

//     throw new AppError('Unsupported export format', 400);
//   } catch (err) {
//     next(err);
//   }
// };
// controllers/exportController.js
import path from 'path'; // ✅ MISSING IMPORT
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Company from '../models/Company.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
// import AppError from '../utils/appError.js'; ❌ If not using it

const formatDateForFilename = (date) => format(date, 'yyyy-MM-dd_HH-mm-ss');
const formatDateForDisplay = (date) => format(date, 'dd MMM yyyy');

const cleanUser = (user) => ({
  Name: user.name,
  Email: user.email,
  Phone: user.phone || '-',
});

const cleanCompany = (company) => ({
  CompanyName: company.name,
  Abbreviation: company.abbreviation,
  Contact: company.contact,
  Email: company.email,
  Plan: company.plan,
});

const cleanTicket = (ticket) => {
  const attachments = ticket.attachments?.length
    ? ticket.attachments.map(att => att.originalname).join(', ')
    : '-';

  return {
    TicketNumber: ticket.ticketNumber,
    Subject: ticket.subject,
    Description: ticket.description,
    Priority: ticket.priority,
    Category: ticket.category,
    Status: ticket.status,
    CreatedAt: formatDateForDisplay(ticket.createdAt),
    ResolvedAt: ticket.resolvedAt ? formatDateForDisplay(ticket.resolvedAt) : '-',
    Client: ticket.user?.name || '-',
    ClientEmail: ticket.user?.email || '-',
    ClientPhone: ticket.user?.phone || '-',
    Company: ticket.company?.name || '-',
    AssignedTo: ticket.assignedTo?.name || '-',
    AssignedEmail: ticket.assignedTo?.email || '-',
    AssignedPhone: ticket.assignedTo?.phone || '-',
    Attachments: attachments,
  };
};

const getModel = (resource) => {
  switch (resource) {
    case 'users': return User;
    case 'tickets': return Ticket;
    case 'companies': return Company;
    default: throw new Error('Invalid resource');
  }
};

const exportExcel = async (res, resource, data) => {
  if (!data.length) throw new Error('No data to export');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${resource.toUpperCase()} Report`);

  let cleanData = [];
  if (resource === 'tickets') cleanData = data.map(cleanTicket);
  else if (resource === 'users') cleanData = data.map(cleanUser);
  else if (resource === 'companies') cleanData = data.map(cleanCompany);

  worksheet.columns = Object.keys(cleanData[0]).map((key) => ({
    header: key,
    key,
    width: 25,
  }));

  cleanData.forEach(item => worksheet.addRow(item));
  worksheet.getRow(1).font = { bold: true };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${resource}_${formatDateForFilename(new Date())}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

const exportPdf = (res, resource, data) => {
  if (!data.length) throw new Error('No data to export');

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${resource}_${formatDateForFilename(new Date())}.pdf`
  );
  doc.pipe(res);

  // ✅ Insert Image at Top
  try {
    const imagePath = path.join(process.cwd(), 'assets', 'salkatech-banner.png');
    doc.image(imagePath, {
      fit: [500, 80],
      align: 'center',
      valign: 'top',
    });
  } catch (err) {
    console.error('Image load failed:', err.message);
  }

  doc.moveDown();
  doc
    .fillColor('#32CD32')
    .fontSize(20)
    .text('SalkaTech Export Report', { align: 'center' })
    .fillColor('black');

  doc.moveDown();
  doc.fontSize(16).text(`Resource: ${resource.toUpperCase()}`, { align: 'center' });
  doc.fontSize(12).text(`Generated at: ${formatDateForFilename(new Date())}`, { align: 'center' });
  doc.moveDown();

  let cleanData = [];
  if (resource === 'tickets') cleanData = data.map(cleanTicket);
  else if (resource === 'users') cleanData = data.map(cleanUser);
  else if (resource === 'companies') cleanData = data.map(cleanCompany);

  cleanData.forEach((item, index) => {
    doc.fontSize(14).fillColor('blue').text(`#${index + 1}`, { underline: true });
    doc.moveDown(0.3);

    Object.entries(item).forEach(([key, value]) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('black')
        .text(`${key}: `, { continued: true });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown();
  });

  doc.end();
};

export const exportResource = async (req, res, next) => {
  try {
    const { resource, format } = req.params;
    const { startDate, endDate } = req.query;

    const Model = getModel(resource);
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const data = await Model.find(query)
      .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
      .exec();

    if (!data.length) {
      return res.status(404).json({ message: 'No data found for export in the given date range' });
    }

    if (format === 'xlsx') return await exportExcel(res, resource, data);
    if (format === 'pdf') return exportPdf(res, resource, data);

    res.status(400).json({ message: 'Unsupported export format' });
  } catch (err) {
    console.error('Export Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


// controllers/exportController.js (update)
// Existing exportResource ke upar naya function:

export const exportPreview = async (req, res, next) => {
  try {
    const { resource } = req.params;
    const { startDate, endDate } = req.query;

    const Model = getModel(resource);

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let data = await Model.find(query)
      .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
      .exec();

    if (data.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'No data found for preview' });
    }

    let cleanData = [];
    if (resource === 'tickets') cleanData = data.map(cleanTicket);
    else if (resource === 'users') cleanData = data.map(cleanUser);
    else if (resource === 'companies') cleanData = data.map(cleanCompany);

    res.status(200).json({ status: 'success', data: cleanData });
  } catch (err) {
    next(err);
  }
};




// // controllers/exportController.js
// import User from '../models/User.js';
// import Ticket from '../models/Ticket.js';
// import Company from '../models/Company.js';
// import ExcelJS from 'exceljs';
// import PDFDocument from 'pdfkit';
// import { format } from 'date-fns';
// import AppError from '../utils/appError.js';

// // Helper functions
// const formatDateForFilename = (date) => format(date, 'yyyy-MM-dd_HH-mm-ss');
// const formatDateForDisplay = (date) => format(date, 'dd MMM yyyy');

// // Data cleaning functions
// const cleanUser = (user) => ({
//   Name: user.name,
//   Email: user.email,
//   Phone: user.phone || '-',
// });

// const cleanCompany = (company) => ({
//   CompanyName: company.name,
//   Address: company.address || 'N/A',
//   Phone: company.phone || 'N/A',
//   Contact: company.contact,
//   Email: company.email,
//   Plan: company.plan,
// });

// const cleanTicket = (ticket) => {
//   const attachments = ticket.attachments?.length
//     ? ticket.attachments.map(att => att.originalname).join(', ')
//     : '-';

//   return {
//     TicketNumber: ticket.ticketNumber,
//     Subject: ticket.subject,
//     Description: ticket.description,
//     Priority: ticket.priority,
//     Category: ticket.category,
//     Status: ticket.status,
//     CreatedAt: formatDateForDisplay(ticket.createdAt),
//     ResolvedAt: ticket.resolvedAt ? formatDateForDisplay(ticket.resolvedAt) : '-',
//     Client: ticket.user ? ticket.user.name : '-',
//     ClientEmail: ticket.user ? ticket.user.email : '-',
//     ClientPhone: ticket.user ? ticket.user.phone : '-',
//     Company: ticket.company ? ticket.company.name : '-',
//     AssignedTo: ticket.assignedTo ? ticket.assignedTo.name : '-',
//     AssignedEmail: ticket.assignedTo ? ticket.assignedTo.email : '-',
//     AssignedPhone: ticket.assignedTo ? ticket.assignedTo.phone : '-',
//     Attachments: attachments,
//   };
// };

// const getModel = (resource) => {
//   switch (resource) {
//     case 'users': return User;
//     case 'tickets': return Ticket;
//     case 'companies': return Company;
//     default: throw new AppError('Invalid resource', 400);
//   }
// };

// // Excel Export - Single Resource
// const exportExcel = async (res, resource, data) => {
//   if (!data.length) throw new AppError('No data to export', 404);

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet(`${resource.toUpperCase()} Report`);
  
//   // Clean and map data
//   let cleanData = [];
//   if (resource === 'tickets') {
//     cleanData = data.map(cleanTicket);
//   } else if (resource === 'users') {
//     cleanData = data.map(cleanUser);
//   } else if (resource === 'companies') {
//     cleanData = data.map(cleanCompany);
//   }

//   // Add timestamp header
//   const timestamp = formatDateForDisplay(new Date());
//   worksheet.addRow([`${resource.toUpperCase()} Report - Exported: ${timestamp}`]);
//   const colCount = Object.keys(cleanData[0] || {}).length;
//   worksheet.mergeCells(`A1:${String.fromCharCode(64 + colCount)}1`);
  
//   // Set columns
//   worksheet.columns = Object.keys(cleanData[0]).map(key => ({
//     header: key.toUpperCase(),
//     key,
//     width: 25
//   }));

//   // Add data rows
//   cleanData.forEach(item => worksheet.addRow(item));

//   // Styling
//   const headerRow = worksheet.getRow(2);
//   headerRow.font = { bold: true };
//   headerRow.fill = {
//     type: 'pattern',
//     pattern: 'solid',
//     fgColor: { argb: 'FFD3D3D3' }
//   };

//   // Auto filter
//   worksheet.autoFilter = {
//     from: { row: 2, column: 1 },
//     to: { row: 2, column: worksheet.columnCount }
//   };

//   // Auto width adjustment
//   worksheet.columns.forEach(column => {
//     let maxLength = 0;
//     column.eachCell({ includeEmpty: true }, cell => {
//       const length = cell.value ? cell.value.toString().length : 10;
//       if (length > maxLength) maxLength = length;
//     });
//     column.width = Math.min(Math.max(maxLength + 2, 10), 30);
//   });

//   // Send file with correct .xlsx extension
//   res.setHeader(
//     'Content-Type',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//   );
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename=${resource}_export_${formatDateForFilename(new Date())}.xlsx`
//   );
  
//   await workbook.xlsx.write(res);
//   res.end();
// };

// // PDF Ticket Card Generator with 3D Gradient Effect
// const generateTicketCard = (doc, ticket, x, y, width, height) => {
//   // Save current state
//   doc.save();
  
//   // Create shadow effect
//   doc.rect(x + 4, y + 4, width, height)
//      .fill('#e0e0e0');
  
//   // Create gradient background
//   const gradient = doc.linearGradient(x, y, x, y + height);
//   gradient.stop(0, '#f8f8f8')  // Light gray top
//          .stop(1, '#ffffff');  // White bottom
         
//   // Draw card with rounded corners
//   doc.roundedRect(x, y, width, height, 8)
//      .fill(gradient)
//      .stroke('#d0d0d0');
  
//   const padding = 15;
//   const contentWidth = width - padding * 2;
//   let currentY = y + padding;

//   // Helper function to render sections
//   const renderSection = (title) => {
//     doc.font('Helvetica-Bold')
//        .fontSize(10)
//        .fillColor('#000000')
//        .text(title, x + padding, currentY);
//     currentY += 15;
//   };

//   // User Details
//   // renderSection('USER DETAILS:');
//   // doc.font('Helvetica').fontSize(10);
//   // doc.text(`Name: ${ticket.user?.name || '-'}`, x + padding, currentY);
//   // currentY += 15;
//   // doc.text(`Email: ${ticket.user?.email || '-'}`, x + padding, currentY);
//   // currentY += 15;
//   // doc.text(`Phone: ${ticket.user?.phone || '-'}`, x + padding, currentY);
//   // currentY += 25;

//   // // Divider
//   // doc.moveTo(x + padding, currentY - 10)
//   //    .lineTo(x + width - padding, currentY - 10)
//   //    .stroke('#d0d0d0');
  
//   // Ticket Details
//   renderSection('TICKET NUMBER:');
//   doc.font('Helvetica-Bold').fontSize(12)
//      .text(ticket.subject, x + padding, currentY, {
//         width: contentWidth,
//         ellipsis: true
//      });
//   currentY += 20;
  
  
//   // Description with auto-wrap
//   doc.font('Helvetica').fontSize(10)
//      .text('Description:', x + padding, currentY);
//   currentY += 15;
  
//   doc.text(ticket.description || 'No description', x + padding, currentY, {
//     width: contentWidth,
//     height: 80,
//     ellipsis: true,
//     lineBreak: true
//   });
//   currentY += 85;
  
//   // Metadata
//   doc.text(`Status: ${ticket.status}`, x + padding, currentY);
//   doc.text(`Created: ${formatDateForDisplay(ticket.createdAt)}`, 
//            x + width - padding - 100, currentY, { width: 100, align: 'right' });
//   currentY += 20;

//   // Company Info
//   renderSection('COMPANY INFO:');
  
//   // Highlight SALKATECH with light green
//   if ((ticket.company?.name || '').toUpperCase() === 'SALKATECH') {
//     doc.fillColor('#90EE90'); // Light green
//   }
  
//   doc.text(ticket.company?.name || '-', x + padding, currentY);
//   doc.fillColor('#000000'); // Reset to black
//   currentY += 15;
//   doc.text(`Location: ${ticket.company?.address || '-'}`, x + padding, currentY);
  
//   // Restore original state
//   doc.restore();
//   return currentY + 10;
// };

// // PDF Export with Enhanced Styling
// const exportPdf = (res, resource, data) => {
//   if (!data.length) {
//     // Create PDF even for error to show message
//     const doc = new PDFDocument({ margin: 30, size: 'A4' });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=${resource}_${formatDateForFilename(new Date())}.pdf`
//     );
//     doc.pipe(res);
    
//     // Error message styling
//     doc.font('Helvetica-Bold')
//        .fontSize(16)
//        .fillColor('#ff0000')
//        .text('Error: No data found for the selected date range.', 50, 150);
    
//     doc.end();
//     return;
//   }

//   const doc = new PDFDocument({ 
//     margin: 30, 
//     size: 'A4',
//     bufferPages: true 
//   });
  
//   // Handle stream errors
//   let hasError = false;
//   doc.on('error', (err) => {
//     hasError = true;
//     res.status(500).end('PDF generation error: ' + err.message);
//   });
  
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename=${resource}_${formatDateForFilename(new Date())}.pdf`
//   );
//   doc.pipe(res);

//   try {
//     // Header with light green SALKATECH
//     doc.fillColor('#90EE90')
//        .font('Helvetica-Bold')
//        .fontSize(20)
//        .text('SALKATECH', { align: 'center', continued: true })
//        .fillColor('#000000')
//        .text(' Export Report', { align: 'right' });
    
//     doc.fillColor('#000000')
//        .font('Helvetica')
//        .fontSize(14)
//        .text('Ticket Management System', { align: 'center' });
    
//     doc.fontSize(10)
//        .text(`Generated: ${formatDateForDisplay(new Date())}`, {
//           align: 'center'
//        });
    
//     doc.moveDown(2);

//     // Resource-specific content
//     if (resource === 'tickets') {
//       const margin = 30;
//       const pageWidth = doc.page.width - margin * 2;
//       const pageHeight = doc.page.height - margin * 2;
//       const cardWidth = (pageWidth - 20) / 2;
//       const cardHeight = (pageHeight - 100) / 2;
      
//       let currentPage = 1;
//       let cardCount = 0;
      
//       for (const ticket of data) {
//         if (hasError) break;
        
//         // Handle page breaks (4 per page)
//         if (cardCount >= 4) {
//           doc.addPage();
//           currentPage++;
//           cardCount = 0;
//         }
        
//         const row = Math.floor(cardCount / 2);
//         const col = cardCount % 2;
        
//         const x = margin + col * (cardWidth + 20);
//         const y = margin + 50 + row * (cardHeight + 20);
        
//         generateTicketCard(doc, ticket, x, y, cardWidth, cardHeight);
//         cardCount++;
//       }
//     } else {
//       // Non-ticket resources (table format)
//       doc.fontSize(16).text(`${resource.toUpperCase()} REPORT`, { align: 'center' });
//       doc.moveDown();
      
//       let cleanData = [];
//       if (resource === 'users') cleanData = data.map(cleanUser);
//       else if (resource === 'companies') cleanData = data.map(cleanCompany);
      
//       // Table headers
//       const headers = Object.keys(cleanData[0]);
//       const columnWidth = (doc.page.width - 100) / headers.length;
//       let y = 150;
      
//       doc.font('Helvetica-Bold').fontSize(10);
//       headers.forEach((header, i) => {
//         doc.text(header.toUpperCase(), 50 + i * columnWidth, y);
//       });
      
//       y += 20;
//       doc.font('Helvetica').fontSize(10);
      
//       // Table rows
//       for (const item of cleanData) {
//         if (hasError) break;
        
//         Object.values(item).forEach((value, i) => {
//           doc.text(value || '-', 50 + i * columnWidth, y, {
//             width: columnWidth - 10,
//             lineBreak: false
//           });
//         });
//         y += 20;
        
//         // Page break
//         if (y > doc.page.height - 50) {
//           doc.addPage();
//           y = 50;
//         }
//       }
//     }
//   } catch (err) {
//     // Handle synchronous errors
//     if (!res.headersSent) {
//       res.status(500).end('PDF generation error: ' + err.message);
//     }
//     return;
//   }

//   doc.end();
// };

// // Main Export Controller
// export const exportResource = async (req, res, next) => {
//   try {
//     const { resource, format } = req.params;
//     const { startDate, endDate } = req.query;

//     const Model = getModel(resource);
    
//     // Date filtering
//     const query = {};
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0); // Start of day
//         query.createdAt.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999); // End of day
//         query.createdAt.$lte = end;
//       }
//     }

//     // Data fetching with population
//     const data = await Model.find(query)
//       .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
//       .lean();
    
//     if (!data.length) {
//       // Special handling for PDF to show error in document
//       if (format === 'pdf') {
//         return exportPdf(res, resource, []);
//       }
//       return next(new AppError('No data found for export', 404));
//     }

//     // Format handling
//     if (format === 'xlsx') return await exportExcel(res, resource, data);
//     if (format === 'pdf') return exportPdf(res, resource, data);
    
//     throw new AppError('Unsupported export format', 400);
//   } catch (err) {
//     next(err);
//   }
// };

// // Preview Function
// export const exportPreview = async (req, res, next) => {
//   try {
//     const { resource } = req.params;
//     const { startDate, endDate } = req.query;

//     const Model = getModel(resource);
    
//     // Date filtering
//     const query = {};
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         query.createdAt.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.createdAt.$lte = end;
//       }
//     }

//     // Data fetching
//     const data = await Model.find(query)
//       .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
//       .lean();
    
//     if (!data.length) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No data found for preview'
//       });
//     }

//     // Data cleaning
//     let cleanData;
//     if (resource === 'tickets') cleanData = data.map(cleanTicket);
//     else if (resource === 'users') cleanData = data.map(cleanUser);
//     else if (resource === 'companies') cleanData = data.map(cleanCompany);

//     res.status(200).json({ 
//       status: 'success', 
//       data: cleanData 
//     });
//   } catch (err) {
//     next(err);
//   }
// };