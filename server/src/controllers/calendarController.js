import pool from '../config/db.js';

export const getCalendarMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month are required' });
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [tasksRes, sessionsRes] = await Promise.all([
      pool.query(
        `SELECT to_char(task_date, 'YYYY-MM-DD') AS date, status, estimated_minutes 
         FROM tasks WHERE user_id = $1 AND task_date BETWEEN $2 AND $3`,
        [req.user.id, startDate, endDate]
      ),
      pool.query(
        `SELECT to_char(session_date, 'YYYY-MM-DD') AS date, duration_seconds 
         FROM work_sessions WHERE user_id = $1 AND session_date BETWEEN $2 AND $3`,
        [req.user.id, startDate, endDate]
      )
    ]);

    const daysMap = {};
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      daysMap[dateStr] = {
        date: dateStr,
        day,
        totalTasks: 0,
        completedTasks: 0,
        plannedMinutes: 0,
        workedMinutes: 0,
        productivityTier: 'none' // 'none' | 'low' | 'average' | 'high'
      };
    }

    tasksRes.rows.forEach((t) => {
      if (daysMap[t.date]) {
        daysMap[t.date].totalTasks++;
        if (t.status === 'completed') daysMap[t.date].completedTasks++;
        daysMap[t.date].plannedMinutes += t.estimated_minutes || 0;
      }
    });

    sessionsRes.rows.forEach((s) => {
      if (daysMap[s.date]) {
        daysMap[s.date].workedMinutes += Math.round((s.duration_seconds || 0) / 60);
      }
    });

    // Assign productivity tiers (Section 9 of specification)
    Object.values(daysMap).forEach((d) => {
      if (d.totalTasks === 0 && d.workedMinutes === 0) {
        d.productivityTier = 'none'; // Gray
      } else {
        const rate = d.plannedMinutes > 0
          ? (d.workedMinutes / d.plannedMinutes) * 100
          : (d.completedTasks > 0 ? 100 : 0);

        if (rate >= 80) d.productivityTier = 'high';       // Green
        else if (rate >= 50) d.productivityTier = 'average'; // Yellow
        else d.productivityTier = 'low';                   // Red
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        year: y,
        month: m,
        days: Object.values(daysMap)
      }
    });
  } catch (error) {
    console.error('getCalendarMonth error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve calendar data' });
  }
};