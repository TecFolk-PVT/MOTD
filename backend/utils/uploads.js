import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');
export const READY_MADE_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'ready-made');

export function ensureUploadDirs() {
  fs.mkdirSync(READY_MADE_UPLOAD_DIR, { recursive: true });
}

export function toPublicUploadPath(folder, filename) {
  return `/uploads/${folder}/${filename}`;
}
