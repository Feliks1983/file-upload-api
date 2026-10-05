import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import multer from 'multer';
import fs from 'fs';
import { MAX_FILE_SIZE, UPLOAD_DIR } from './config/multer';
import {router as uploadRoutes} from './routes/upload';

const app = express();

app.use(helmet());

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/upload', uploadRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      limitFileSize: `The file is too large (maximum ${MAX_FILE_SIZE} byte)`,
      limitFileCount: 'Too many files',
      limitUnexpectedFile: 'Unexpected file field',
    };
    return res.status(400).json({ error: messages[err.code] || err.message });
  }
  if (err.message?.startsWith('Unacceptable') || err.message?.includes('MIME-type')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`The server has started: http://localhost:${PORT}`));
