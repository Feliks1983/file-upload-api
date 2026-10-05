import { Router} from "express";
import rateLimit from 'express-rate-limit';
import { upload } from "../config/multer";
import { validateFilename, validateUploaded } from "../middleware/validation";
import { uploadFields, uploadMultiple, uploadSingle, listFiles, getFile, deleteFile} from '../controllers/uploadController'

export const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 20 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many downloads; please try again later.',
  },
});

router.post('/single', uploadLimiter, upload.single('file'), validateUploaded, uploadSingle);

router.post('/multiple', uploadLimiter, upload.array('files', 5), validateUploaded, uploadMultiple)
router.post(
  '/fields', 
  uploadLimiter,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]),
  validateUploaded,
  uploadFields
);
router.get('/files', listFiles);
router.get('/file/:filename', validateFilename, getFile);
router.delete('/file/:filename', validateFilename, deleteFile);


