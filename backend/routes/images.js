import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();

// File Filter for Images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, gif, webp, etc.) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// @route   POST api/images/upload
// @desc    Upload a new image (Cloudinary with local filesystem fallback)
// @access  Private
router.post('/upload', auth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { name, folderId } = req.body;
      const file = req.file;

      if (!name) {
        return res.status(400).json({ message: 'Image display name is required' });
      }

      if (!file) {
        return res.status(400).json({ message: 'Please upload an image file' });
      }

      // Verify folder belongs to user if folderId is provided
      let parentFolder = null;
      if (folderId && folderId !== 'null' && folderId !== 'undefined' && folderId !== '') {
        parentFolder = await Folder.findOne({ _id: folderId, owner: req.user.id });
        if (!parentFolder) {
          return res.status(404).json({ message: 'Target folder not found' });
        }
      }

      const isCloudinaryConfigured = 
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET;

      if (isCloudinaryConfigured) {
        // Upload stream to Cloudinary
        const uploadToCloudinary = (fileBuffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'dobby_drive' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(fileBuffer);
          });
        };

        const result = await uploadToCloudinary(file.buffer);

        const newImage = new Image({
          name,
          filename: result.public_id,
          path: result.secure_url, // Absolute secure URL from Cloudinary
          size: file.size,
          folder: (parentFolder && parentFolder._id) || null,
          owner: req.user.id,
        });

        const savedImage = await newImage.save();
        return res.status(201).json(savedImage);
      } else {
        // Fallback: Save to local filesystem if Cloudinary is not configured
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = `image-${uniqueSuffix}${ext}`;
        const localPath = path.join(uploadDir, filename);

        // Write buffer to local disk
        fs.writeFileSync(localPath, file.buffer);

        const relativePath = `/uploads/${filename}`;

        const newImage = new Image({
          name,
          filename: filename,
          path: relativePath, // Local relative path
          size: file.size,
          folder: (parentFolder && parentFolder._id) || null,
          owner: req.user.id,
        });

        const savedImage = await newImage.save();
        return res.status(201).json(savedImage);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: error.message || 'Server error saving image metadata' });
    }
  });
});

export default router;
