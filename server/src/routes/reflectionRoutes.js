import express from 'express';
import { getReflection, saveReflection } from '../controllers/reflectionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/:date', getReflection);
router.put('/:date', saveReflection);

export default router;