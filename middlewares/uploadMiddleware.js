import multer from 'multer';
import AppError from '../utils/appError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `ticket-${req.params.id}-${Date.now()}.${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || 
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'text/plain') {
    cb(null, true);
  } else {
    cb(new AppError('Not an image or PDF! Please upload only images or PDFs.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
});

export const uploadTicketFiles = upload.array('attachments', 5);

export const resizeTicketFiles = async (req, res, next) => {
  if (!req.files) return next();

  req.body.attachments = req.files.map(file => ({
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  }));

  next();
};