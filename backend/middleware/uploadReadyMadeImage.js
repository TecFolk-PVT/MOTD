import multer from 'multer';
import { processAndStoreImage } from '../utils/imageStorage.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

/** Shared multer middleware for single image uploads (ready-made, tailor shop, etc.). */
export function uploadSingleImageMiddleware(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).send({ message: 'Image must be 5MB or smaller' });
      return;
    }

    res.status(400).send({ message: err.message || 'Invalid image upload' });
  });
}

export const uploadReadyMadeImageMiddleware = uploadSingleImageMiddleware;

export function processReadyMadeImage(file) {
  return processAndStoreImage(file, {
    folder: 'ready-made',
    filenamePrefix: 'ready-made',
    resize: {
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    },
  });
}

export function processTailorDesignImage(file) {
  return processAndStoreImage(file, {
    folder: 'tailor-design',
    filenamePrefix: 'tailor-design',
    resize: {
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    },
  });
}

export function processTailorShopImage(file, { variant = 'cover' } = {}) {
  const isLogo = variant === 'logo';

  return processAndStoreImage(file, {
    folder: 'tailor-shop',
    filenamePrefix: `tailor-shop-${variant}`,
    resize: {
      width: isLogo ? 1200 : 1920,
      height: isLogo ? 1200 : 1080,
      fit: 'inside',
      withoutEnlargement: true,
    },
  });
}
