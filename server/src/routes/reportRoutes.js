import express from 'express';
import { getDashboardSummary, getWeeklyReport, getMonthlyReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);

export default router;