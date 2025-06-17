import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../utils/appError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    uploadDir,
    path.join(uploadDir, 'tickets'),
    path.join(uploadDir, 'profiles')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createUploadDirs();

// File type validation
const isValidFileType = (mimetype) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv'
  ];
  return allowedTypes.includes(mimetype);
};

// File type to category mapper
const fileTypeCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('text/')) return 'text';
  if (mimetype.includes('spreadsheet')) return 'spreadsheet';
  if (mimetype.includes('word')) return 'document';
  return 'other';
};

// ============ TICKET FILE UPLOAD ============
const ticketStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, 'tickets'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `ticket-${uniqueSuffix}${ext}`);
  }
});

const ticketFileFilter = (req, file, cb) => {
  if (isValidFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400), false);
  }
};

export const uploadTicketFiles = multer({
  storage: ticketStorage,
  fileFilter: ticketFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).array('attachments', 5); // Max 5 files

export const processTicketFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    req.body.attachments = await Promise.all(
      req.files.map(async (file) => {
        const category = fileTypeCategory(file.mimetype);
        let processedPath = file.path;

        if (category === 'image') {
          const resizedFilename = `resized-${file.filename}`;
          const resizedPath = path.join(uploadDir, 'tickets', resizedFilename);

          await sharp(file.path)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .withMetadata()
            .toFormat('jpeg', { quality: 85 })
            .toFile(resizedPath);

          fs.unlinkSync(file.path);
          processedPath = resizedPath;
          file.filename = resizedFilename;
        }

        return {
          originalname: file.originalname,
          filename: file.filename,
          path: processedPath.replace(/\\/g, '/').replace(/.*\/uploads/, '/uploads'),
          size: file.size,
          mimetype: file.mimetype,
          category
        };
      })
    );

    next();
  } catch (err) {
    console.error('Error processing ticket files:', err);
    return next(new AppError('Error processing uploaded files', 500));
  }
};

// ============ PROFILE PHOTO UPLOAD ============
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, 'profiles'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}${ext}`);
  }
});

const profileFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed for profile photos', 400), false);
  }
};

export const uploadUserPhoto = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
}).single('profilePhoto');

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `profile-${req.user.id}.jpeg`;
    const filePath = path.join(uploadDir, 'profiles', filename);

    await sharp(req.file.path)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({
        quality: 90,
        progressive: true,
        optimizeScans: true
      })
      .toFile(filePath);

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    req.file.filename = filename;
    req.file.path = `/uploads/profiles/${filename}`;

    next();
  } catch (err) {
    console.error('Error processing profile photo:', err);
    return next(new AppError('Error processing profile photo', 500));
  }
};

// ============ FILE DELETE UTILITY ============
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
};

// ============ FILE ICON BY TYPE ============
export const getFileIcon = (mimetype) => {
  const category = fileTypeCategory(mimetype);
  const icons = {
    image: '🖼️',
    pdf: '📄',
    text: '📝',
    spreadsheet: '📊',
    document: '📑',
    other: '📁'
  };
  return icons[category] || '📁';
};
