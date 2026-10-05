import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from 'fs';
import { error } from "console";

const signatures: Record<string, number[][]> = {
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  pdf: [[0x25, 0x50, 0x44, 0x46]],
};

function collectFiles(req: Request): Express.Multer.File[] {
  if(req.file) return [req.file];
  if(Array.isArray(req.files)) return req.files;
  if(req.files) return Object.values(req.files).flat();
  return [];
}

function matchesSignature(file: Express.Multer.File): boolean {
  const ext = path.extname(file.filename).toLowerCase().replace('.', '');
  const sigs = signatures[ext];
  if(!sigs) {
    const buf = fs.readFileSync(file.path);
    return !buf.includes(0);
  }
  const fd = fs.openSync(file.path, 'r');
  try {
    const head = Buffer.alloc(8);
    fs.readSync(fd, head, 0, 8, 0);
    return sigs.some((sig) => sig.every((b, i) => head[i] === b));
  } finally {
    fs.closeSync(fd);
  }
}

export function validateUploaded(req: Request, res: Response, next: NextFunction) {
  const files = collectFiles(req);
  if(files.length === 0) {
    return res.status(400).json({ error: 'File not transferred'});
  }
  const bad = files.filter((f) => !matchesSignature(f));
  if(bad.length > 0) {
    files.forEach((f) => fs.unlink(f.path, () => undefined));
    return res.status(400).json({
      error: 'The file content does not match its type',
      files: bad.map((f) => f.originalname),
    })
  }
  next();
}

export function validateFilename (req: Request, res: Response, next: NextFunction) {
  const name = String(req.params.filename);
  if (!/^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(name) || name !== path.basename(name)) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  next();
}

