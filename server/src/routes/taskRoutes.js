import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  toggleTaskStatus, 
  deleteTask, 
  reorderTasks 
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.post('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.patch('/:id/status', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;