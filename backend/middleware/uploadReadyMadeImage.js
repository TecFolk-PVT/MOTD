import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { randomBytes } from 'crypto';
import { READY_MADE_UPLOAD_DIR, toPublicUploadPath } from '../utils/uploads.js';

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

export function uploadReadyMadeImageMiddleware(req, res, next) {
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

export async function processReadyMadeImage(file) {
  const filename = `ready-made-${Date.now()}-${randomBytes(4).toString('hex')}.webp`;
  const outputPath = path.join(READY_MADE_UPLOAD_DIR, filename);

  await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(outputPath);

  return toPublicUploadPath('ready-made', filename);
}
