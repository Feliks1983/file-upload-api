import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');
export const maxFileSize = 5242880;
export const MAX_FILE_SIZE = Number(maxFileSize) || 5 * 1024 * 1024;
export const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'];
export const ALLOWED_MIMES: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  pdf: ['application/pdf'],
  txt: ['text/plain'],
};

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedMimes = ALLOWED_MIMES[ext];
  if (!allowedExtensions.includes(ext) || !allowedMimes) {
    return cb(new Error(`Invalid file extension: .${ext || '?'}`));
  }
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`MIME-type ${file.mimetype} does not match the extension .${ext}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
});
