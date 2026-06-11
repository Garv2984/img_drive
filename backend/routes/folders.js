import express from 'express';
import Folder from '../models/Folder.js';
import Image from '../models/Image.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/folders
// @desc    Create a new folder
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // If parent is specified, verify it exists and belongs to the user
    let parentFolder = null;
    if (parent) {
      parentFolder = await Folder.findOne({ _id: parent, owner: req.user.id });
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    const newFolder = new Folder({
      name,
      parent: parent || null,
      owner: req.user.id,
    });

    const savedFolder = await newFolder.save();
    
    // Return the new folder, initialized with size 0
    res.status(201).json({
      ...savedFolder.toObject(),
      size: 0
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error creating folder' });
  }
});

// @route   GET api/folders/all
// @desc    Get all folders flat list (useful for breadcrumbs/UI tree)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user.id });
    res.json(folders);
  } catch (error) {
    console.error('Fetch all folders error:', error);
    res.status(500).json({ message: 'Server error fetching folders' });
  }
});

// @route   GET api/folders/contents
// @desc    Get subfolders and images in a folder with recursive size calculation
// @access  Private
router.get('/contents', auth, async (req, res) => {
  try {
    const parentId = req.query.parent || null;
    
    // Verify parent folder exists and is owned by the user if parentId is provided
    if (parentId && parentId !== 'null') {
      const parentFolder = await Folder.findOne({ _id: parentId, owner: req.user.id });
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found or access denied' });
      }
    }

    // 1. Fetch all folders and images for this user to build the sizing tree
    const allFolders = await Folder.find({ owner: req.user.id });
    const allImages = await Image.find({ owner: req.user.id });

    // 2. Build mapping tables
    const folderChildren = {}; // parentId -> [Folder]
    const folderImages = {};   // folderId -> [Image]

    allFolders.forEach(folder => {
      const pId = folder.parent ? folder.parent.toString() : 'root';
      if (!folderChildren[pId]) {
        folderChildren[pId] = [];
      }
      folderChildren[pId].push(folder);
    });

    allImages.forEach(img => {
      const fId = img.folder ? img.folder.toString() : 'root';
      if (!folderImages[fId]) {
        folderImages[fId] = [];
      }
      folderImages[fId].push(img);
    });

    // 3. Compute sizes recursively with memoization
    const memoSizes = {};

    const getFolderSize = (folderIdStr) => {
      if (memoSizes[folderIdStr] !== undefined) {
        return memoSizes[folderIdStr];
      }

      let totalSize = 0;

      // Add direct images size
      if (folderImages[folderIdStr]) {
        totalSize += folderImages[folderIdStr].reduce((sum, img) => sum + img.size, 0);
      }

      // Add child folders size recursively
      if (folderChildren[folderIdStr]) {
        folderChildren[folderIdStr].forEach(child => {
          totalSize += getFolderSize(child._id.toString());
        });
      }

      memoSizes[folderIdStr] = totalSize;
      return totalSize;
    };

    // Precalculate sizes for all folders
    allFolders.forEach(folder => {
      getFolderSize(folder._id.toString());
    });

    // 4. Filter contents of requested parent directory
    const targetParentKey = (parentId && parentId !== 'null') ? parentId.toString() : 'root';

    // Immediate child folders
    const immediateFolders = allFolders.filter(f => {
      const pStr = f.parent ? f.parent.toString() : 'root';
      return pStr === targetParentKey;
    });

    // Attach computed sizes to the output folders
    const enrichedFolders = immediateFolders.map(folder => {
      return {
        ...folder.toObject(),
        size: memoSizes[folder._id.toString()] || 0
      };
    });

    // Immediate child images
    const immediateImages = allImages.filter(img => {
      const fStr = img.folder ? img.folder.toString() : 'root';
      return fStr === targetParentKey;
    });

    res.json({
      folders: enrichedFolders,
      images: immediateImages
    });

  } catch (error) {
    console.error('Fetch folder contents error:', error);
    res.status(500).json({ message: 'Server error retrieving folder contents' });
  }
});

export default router;
