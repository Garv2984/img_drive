import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save file with unique timestamp + safe extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

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
// @desc    Upload a new image
// @access  Private
router.post('/upload', auth, (req, res) => {
  // Use multer upload middleware
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred.
      return res.status(400).json({ message: err.message });
    }

    try {
      const { name, folderId } = req.body;
      const file = req.file;

      if (!name) {
        // If upload happened, remove the physical file to avoid orphaned files
        if (file) fs.unlinkSync(file.path);
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
          fs.unlinkSync(file.path);
          return res.status(404).json({ message: 'Target folder not found' });
        }
      }

      const relativePath = `/uploads/${file.filename}`;

      const newImage = new Image({
        name,
        filename: file.filename,
        path: relativePath,
        size: file.size, // Size in bytes
        folder: (parentFolder && parentFolder._id) || null,
        owner: req.user.id,
      });

      const savedImage = await newImage.save();
      res.status(201).json(savedImage);
    } catch (error) {
      console.error('Image upload save error:', error);
      // Clean up uploaded file if DB save fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Server error saving image metadata' });
    }
  });
});

export default router;
