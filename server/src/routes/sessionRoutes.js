import express from 'express';
import {
  getActiveSession,
  startSession,
  stopSession,
  logManualSession,
  getSessions,
  deleteSession
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/active', getActiveSession);
router.post('/start', startSession);
router.post('/:id/stop', stopSession);
router.post('/manual', logManualSession);
router.get('/', getSessions);
router.delete('/:id', deleteSession);

export default router;