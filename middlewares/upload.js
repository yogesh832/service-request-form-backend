import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Common function to decide resource_type
const getResourceType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'raw';
  if (mimetype.startsWith('image/')) return 'image';
  return 'auto';
};

// 1. For Profile Photo (Single Upload)
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: getResourceType(file.mimetype),
    public_id: `user-${req.user._id}-${Date.now()}`
  })
});

export const uploadProfilePhoto = multer({ storage: profileStorage }).single('profilePhoto');

// 2. For Ticket Attachments (Multiple Uploads)
const ticketStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'ticket_attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: getResourceType(file.mimetype),
    public_id: `ticket-${Date.now()}-${file.originalname.split('.')[0]}`
  })
});

export const uploadTicketFiles = multer({ storage: ticketStorage }).array('attachments', 5);

// Middleware to process files
export const processTicketFiles = (req, res, next) => {
  // Map Cloudinary response to attachment objects
  if (req.files) {
    req.attachments = req.files.map(file => ({
      path: file.path, // Cloudinary URL
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }));
  }
  next();
};