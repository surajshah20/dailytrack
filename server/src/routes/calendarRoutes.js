import express from 'express';
import { getCalendarMonth } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getCalendarMonth);

export default router;