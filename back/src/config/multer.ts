import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// Define upload directories
const uploadDirs = {
  avatars: path.join(__dirname, '../../public/uploads/avatars'),
  blogHeroes: path.join(__dirname, '../../public/uploads/blog-heroes'),
};

// Ensure upload directories exist
for (const dir of Object.values(uploadDirs)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.avatars);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${timestamp}${ext}`);
  },
});

// Configure storage for blog hero images
const blogHeroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.blogHeroes);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `hero-${timestamp}${ext}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'));
  }
};

// Create multer upload instances
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const blogHeroUpload = multer({
  storage: blogHeroStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for blog hero images
  },
});

export { avatarUpload, blogHeroUpload };
