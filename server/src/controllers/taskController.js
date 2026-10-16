import pool from '../config/db.js';
import { instantiateRecurringTasks } from '../services/recurrenceService.js';

export const getTasks = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required' });
    }

    // Lazily instantiate recurring rules for this day
    await instantiateRecurringTasks(req.user.id, date);

    const result = await pool.query(
      `SELECT 
         t.id, 
         t.user_id, 
         t.category_id, 
         t.recurring_rule_id, 
         t.title, 
         t.description,
         to_char(t.task_date, 'YYYY-MM-DD') AS task_date,
         to_char(t.start_time, 'HH24:MI') AS start_time,
         to_char(t.end_time, 'HH24:MI') AS end_time,
         t.estimated_minutes, 
         t.actual_minutes, 
         t.status, 
         t.priority, 
         t.position,
         t.completed_at, 
         t.created_at, 
         t.updated_at,
         c.name AS category_name, 
         c.color_hex AS category_color, 
         c.icon AS category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.task_date = $2
       ORDER BY t.position ASC, t.created_at ASC`,
      [req.user.id, date]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description = '',
      taskDate,
      startTime = null,
      endTime = null,
      estimatedMinutes = 0,
      priority = 'medium',
      categoryId = null
    } = req.body;

    if (!title || !title.trim() || !taskDate) {
      return res.status(400).json({ success: false, message: 'Title and task date are required' });
    }

    // Get current max position for the date to place new task at the bottom
    const posResult = await pool.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM tasks WHERE user_id = $1 AND task_date = $2`,
      [req.user.id, taskDate]
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(
      `INSERT INTO tasks (
         user_id, category_id, title, description, task_date, 
         start_time, end_time, estimated_minutes, priority, position, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING 
         id, user_id, category_id, title, description,
         to_char(task_date, 'YYYY-MM-DD') AS task_date,
         to_char(start_time, 'HH24:MI') AS start_time,
         to_char(end_time, 'HH24:MI') AS end_time,
         estimated_minutes, actual_minutes, status, priority, position, created_at`,
      [
        req.user.id,
        categoryId || null,
        title.trim(),
        description ? description.trim() : '',
        taskDate,
        startTime || null,
        endTime || null,
        parseInt(estimatedMinutes, 10) || 0,
        priority,
        position
      ]
    );

    const createdTask = result.rows[0];

    // If category attached, fetch category details
    if (createdTask.category_id) {
      const catResult = await pool.query(
        'SELECT name AS category_name, color_hex AS category_color, icon AS category_icon FROM categories WHERE id = $1',
        [createdTask.category_id]
      );
      if (catResult.rows.length > 0) {
        Object.assign(createdTask, catResult.rows[0]);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      taskDate,
      startTime,
      endTime,
      estimatedMinutes,
      actualMinutes,
      status,
      priority,
      categoryId
    } = req.body;

    const completedAt = status === 'completed' ? 'NOW()' : null;

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           task_date = COALESCE($3, task_date),
           start_time = $4,
           end_time = $5,
           estimated_minutes = COALESCE($6, estimated_minutes),
           actual_minutes = COALESCE($7, actual_minutes),
           status = COALESCE($8, status),
           priority = COALESCE($9, priority),
           category_id = $10,
           completed_at = CASE 
             WHEN $8 = 'completed' AND status != 'completed' THEN NOW()
             WHEN $8 != 'completed' THEN NULL 
             ELSE completed_at 
           END,
           updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING 
         id, user_id, category_id, title, description,
         to_char(task_date, 'YYYY-MM-DD') AS task_date,
         to_char(start_time, 'HH24:MI') AS start_time,
         to_char(end_time, 'HH24:MI') AS end_time,
         estimated_minutes, actual_minutes, status, priority, position, completed_at, updated_at`,
      [
        title ? title.trim() : null,
        description !== undefined ? description.trim() : null,
        taskDate || null,
        startTime || null,
        endTime || null,
        estimatedMinutes !== undefined ? parseInt(estimatedMinutes, 10) : null,
        actualMinutes !== undefined ? parseInt(actualMinutes, 10) : null,
        status || null,
        priority || null,
        categoryId || null,
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = result.rows[0];
    if (updatedTask.category_id) {
      const catResult = await pool.query(
        'SELECT name AS category_name, color_hex AS category_color, icon AS category_icon FROM categories WHERE id = $1',
        [updatedTask.category_id]
      );
      if (catResult.rows.length > 0) {
        Object.assign(updatedTask, catResult.rows[0]);
      }
    }

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

export const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current status
    const taskQuery = await pool.query('SELECT status FROM tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const currentStatus = taskQuery.rows[0].status;
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    const result = await pool.query(
      `UPDATE tasks
       SET status = $1,
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING 
         id, user_id, category_id, title, description,
         to_char(task_date, 'YYYY-MM-DD') AS task_date,
         to_char(start_time, 'HH24:MI') AS start_time,
         to_char(end_time, 'HH24:MI') AS end_time,
         estimated_minutes, actual_minutes, status, priority, position, completed_at`,
      [nextStatus, id, req.user.id]
    );

    const task = result.rows[0];
    if (task.category_id) {
      const catResult = await pool.query(
        'SELECT name AS category_name, color_hex AS category_color, icon AS category_icon FROM categories WHERE id = $1',
        [task.category_id]
      );
      if (catResult.rows.length > 0) {
        Object.assign(task, catResult.rows[0]);
      }
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error('toggleTaskStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle task status' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};

export const reorderTasks = async (req, res) => {
  const client = await pool.connect();
  try {
    const { tasks } = req.body; // Array of { id, position }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Tasks array is required' });
    }

    await client.query('BEGIN');
    for (const item of tasks) {
      await client.query(
        'UPDATE tasks SET position = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
        [item.position, item.id, req.user.id]
      );
    }
    await client.query('COMMIT');

    return res.status(200).json({ success: true, message: 'Tasks reordered successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('reorderTasks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reorder tasks' });
  } finally {
    client.release();
  }
};