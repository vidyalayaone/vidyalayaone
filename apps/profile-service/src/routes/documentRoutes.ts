import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { multerUpload, uploadDocument } from '../controllers/documents/uploadDocument';
import { getDocument } from '../controllers/documents/getDocument';
import { listDocuments } from '../controllers/documents/listDocuments';

const router: Router = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

router.get('/', limiter, listDocuments);
router.post('/upload', limiter, multerUpload, uploadDocument);
router.get('/:id', limiter, getDocument);

export default router;
