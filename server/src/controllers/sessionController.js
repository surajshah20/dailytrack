import pool from '../config/db.js';

export const getActiveSession = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         s.id, s.user_id, s.task_id, s.category_id, 
         to_char(s.session_date, 'YYYY-MM-DD') AS session_date,
         s.started_at, s.is_running, s.notes,
         t.title AS task_title,
         c.name AS category_name, c.color_hex AS category_color
       FROM work_sessions s
       LEFT JOIN tasks t ON s.task_id = t.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.user_id = $1 AND s.is_running = true
       LIMIT 1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('getActiveSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active session' });
  }
};

export const startSession = async (req, res) => {
  try {
    const { taskId = null, categoryId = null, notes = '' } = req.body;

    // Check if a session is already running
    const activeCheck = await pool.query(
      'SELECT id FROM work_sessions WHERE user_id = $1 AND is_running = true',
      [req.user.id]
    );

    if (activeCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A work session is already running. Stop it before starting a new one.'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO work_sessions (user_id, task_id, category_id, session_date, started_at, is_running, notes)
       VALUES ($1, $2, $3, $4, NOW(), true, $5)
       RETURNING 
         id, user_id, task_id, category_id, 
         to_char(session_date, 'YYYY-MM-DD') AS session_date,
         started_at, is_running, notes`,
      [req.user.id, taskId || null, categoryId || null, today, notes]
    );

    const session = result.rows[0];

    // Attach task / category titles if selected
    if (session.task_id) {
      const t = await pool.query('SELECT title FROM tasks WHERE id = $1', [session.task_id]);
      if (t.rows.length > 0) session.task_title = t.rows[0].title;
    }
    if (session.category_id) {
      const c = await pool.query('SELECT name, color_hex FROM categories WHERE id = $1', [session.category_id]);
      if (c.rows.length > 0) {
        session.category_name = c.rows[0].name;
        session.category_color = c.rows[0].color_hex;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Work session started',
      data: session
    });
  } catch (error) {
    console.error('startSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start session' });
  }
};

export const stopSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Fetch the running session
    const check = await client.query(
      'SELECT id, task_id, started_at FROM work_sessions WHERE id = $1 AND user_id = $2 AND is_running = true',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Active session not found' });
    }

    const session = check.rows[0];
    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.max(1, Math.round((endedAt - startedAt) / 1000));
    const durationMinutes = Math.round(durationSeconds / 60);

    await client.query('BEGIN');

    // Update work session
    const updateResult = await client.query(
      `UPDATE work_sessions
       SET ended_at = $1,
           duration_seconds = $2,
           is_running = false,
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, task_id, category_id, session_date, started_at, ended_at, duration_seconds, notes`,
      [endedAt.toISOString(), durationSeconds, notes || null, id]
    );

    // If attached to a task, increment the task's actual_minutes
    if (session.task_id && durationMinutes > 0) {
      await client.query(
        `UPDATE tasks 
         SET actual_minutes = actual_minutes + $1,
             updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [durationMinutes, session.task_id, req.user.id]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Work session ended',
      data: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('stopSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to stop session' });
  } finally {
    client.release();
  }
};

export const logManualSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      taskId = null,
      categoryId = null,
      sessionDate,
      startTime, // HH:MM
      endTime,   // HH:MM
      durationMinutes,
      notes = ''
    } = req.body;

    if (!sessionDate) {
      return res.status(400).json({ success: false, message: 'Session date is required' });
    }

    let calculatedMinutes = parseInt(durationMinutes, 10);

    // If start and end times provided, calculate duration from them
    let startedAt = `${sessionDate}T${startTime || '09:00'}:00.000Z`;
    let endedAt = `${sessionDate}T${endTime || '10:00'}:00.000Z`;

    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      calculatedMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (calculatedMinutes < 0) calculatedMinutes += 24 * 60; // Over midnight
    }

    const durationSeconds = (calculatedMinutes || 0) * 60;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO work_sessions (
         user_id, task_id, category_id, session_date, 
         started_at, ended_at, duration_seconds, is_running, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)
       RETURNING 
         id, user_id, task_id, category_id,
         to_char(session_date, 'YYYY-MM-DD') AS session_date,
         started_at, ended_at, duration_seconds, notes, created_at`,
      [
        req.user.id,
        taskId || null,
        categoryId || null,
        sessionDate,
        startedAt,
        endedAt,
        durationSeconds,
        notes
      ]
    );

    // If attached to a task, increment the task's actual_minutes
    if (taskId && calculatedMinutes > 0) {
      await client.query(
        `UPDATE tasks 
         SET actual_minutes = actual_minutes + $1, updated_at = NOW() 
         WHERE id = $2 AND user_id = $3`,
        [calculatedMinutes, taskId, req.user.id]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Work session logged successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('logManualSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to log manual session' });
  } finally {
    client.release();
  }
};

export const getSessions = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required' });
    }

    const result = await pool.query(
      `SELECT 
         s.id, s.user_id, s.task_id, s.category_id,
         to_char(s.session_date, 'YYYY-MM-DD') AS session_date,
         s.started_at, s.ended_at, s.duration_seconds, s.is_running, s.notes,
         t.title AS task_title,
         c.name AS category_name, c.color_hex AS category_color
       FROM work_sessions s
       LEFT JOIN tasks t ON s.task_id = t.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.user_id = $1 AND s.session_date = $2
       ORDER BY s.started_at DESC`,
      [req.user.id, date]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getSessions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve sessions' });
  }
};

export const deleteSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const find = await client.query(
      'SELECT task_id, duration_seconds FROM work_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (find.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const session = find.rows[0];
    const durationMinutes = Math.round((session.duration_seconds || 0) / 60);

    await client.query('BEGIN');

    // Decrement actual minutes from task if it was linked
    if (session.task_id && durationMinutes > 0) {
      await client.query(
        `UPDATE tasks 
         SET actual_minutes = GREATEST(0, actual_minutes - $1), updated_at = NOW() 
         WHERE id = $2 AND user_id = $3`,
        [durationMinutes, session.task_id, req.user.id]
      );
    }

    await client.query('DELETE FROM work_sessions WHERE id = $1', [id]);

    await client.query('COMMIT');

    return res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('deleteSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete session' });
  } finally {
    client.release();
  }
};