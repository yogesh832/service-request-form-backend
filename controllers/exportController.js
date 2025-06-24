// controllers/exportController.js
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Company from '../models/Company.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import AppError from '../utils/appError.js';

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
  // Format attachments as filenames joined by commas or "-"
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
    Client: ticket.user ? ticket.user.name : '-',
    ClientEmail: ticket.user ? ticket.user.email : '-',
    ClientPhone: ticket.user ? ticket.user.phone : '-',
    Company: ticket.company ? ticket.company.name : '-',
    AssignedTo: ticket.assignedTo ? ticket.assignedTo.name : '-',
    AssignedEmail: ticket.assignedTo ? ticket.assignedTo.email : '-',
    AssignedPhone: ticket.assignedTo ? ticket.assignedTo.phone : '-',
    Attachments: attachments,
  };
};

const getModel = (resource) => {
  switch (resource) {
    case 'users': return User;
    case 'tickets': return Ticket;
    case 'companies': return Company;
    default: throw new AppError('Invalid resource', 400);
  }
};

const exportExcel = async (res, resource, data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${resource.toUpperCase()} Report`);

  if (!data.length) throw new AppError('No data to export', 404);

  // Clean and map data
  let cleanData = [];
  if (resource === 'tickets') {
    cleanData = data.map(cleanTicket);
  } else if (resource === 'users') {
    cleanData = data.map(cleanUser);
  } else if (resource === 'companies') {
    cleanData = data.map(cleanCompany);
  }

  // Set headers
  worksheet.columns = Object.keys(cleanData[0]).map((key) => ({
    header: key,
    key,
    width: 25,
  }));

  // Add rows
  cleanData.forEach(item => worksheet.addRow(item));

  // Styling header row bold
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
  if (!data.length) throw new AppError('No data to export', 404);

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${resource}_${formatDateForFilename(new Date())}.pdf`
  );
  doc.pipe(res);

  doc.fontSize(20).text('Sallka Tech Export Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Resource: ${resource.toUpperCase()}`, { align: 'center' });
  doc.fontSize(12).text(`Generated at: ${formatDateForFilename(new Date())}`, {
    align: 'center',
  });
  doc.moveDown();

  let cleanData = [];
  if (resource === 'tickets') {
    cleanData = data.map(cleanTicket);
  } else if (resource === 'users') {
    cleanData = data.map(cleanUser);
  } else if (resource === 'companies') {
    cleanData = data.map(cleanCompany);
  }

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
    const { startDate, endDate, preview } = req.query;

    const Model = getModel(resource);

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // start of day
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // end of day
        query.createdAt.$lte = end;
      }
    }

    let data = await Model.find(query)
      .populate(resource === 'tickets' ? ['user', 'assignedTo', 'company'] : [])
      .exec();

    if (data.length === 0) {
      return next(new AppError('No data found for export in the given date range', 404));
    }

    if (format === 'excel') return await exportExcel(res, resource, data);
    if (format === 'pdf') return exportPdf(res, resource, data);

    throw new AppError('Unsupported export format', 400);
  } catch (err) {
    next(err);
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
