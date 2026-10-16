import pool from '../config/db.js';
import { calculateStreaks } from '../services/streakService.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user.id;

    const [tasksRes, sessionsRes, streaks] = await Promise.all([
      pool.query(
        `SELECT id, status, estimated_minutes, actual_minutes, title, priority 
         FROM tasks WHERE user_id = $1 AND task_date = $2`,
        [userId, today]
      ),
      pool.query(
        `SELECT duration_seconds, is_running FROM work_sessions 
         WHERE user_id = $1 AND session_date = $2`,
        [userId, today]
      ),
      calculateStreaks(userId)
    ]);

    const tasks = tasksRes.rows;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const plannedMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);

    const workedMinutes = sessionsRes.rows.reduce(
      (sum, s) => sum + Math.round((s.duration_seconds || 0) / 60),
      0
    );

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const productivityRate = plannedMinutes > 0 ? Math.min(100, Math.round((workedMinutes / plannedMinutes) * 100)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        today,
        totalTasks,
        completedTasks,
        remainingTasks: totalTasks - completedTasks,
        plannedMinutes,
        workedMinutes,
        completionRate,
        productivityRate,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        tasks: tasks.slice(0, 5) // Recent 5 tasks
      }
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics' });
  }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const { startDate } = req.query;
    if (!startDate) {
      return res.status(400).json({ success: false, message: 'startDate (YYYY-MM-DD) is required' });
    }

    const userId = req.user.id;
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate 7 consecutive days
    const startObj = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startObj);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        plannedMinutes: 0,
        workedMinutes: 0,
        totalTasks: 0,
        completedTasks: 0,
        productivityRate: 0
      });
    }

    const endDate = days[6].date;

    const [tasksRes, sessionsRes, streaks] = await Promise.all([
      pool.query(
        `SELECT to_char(task_date, 'YYYY-MM-DD') AS date, status, estimated_minutes 
         FROM tasks 
         WHERE user_id = $1 AND task_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      ),
      pool.query(
        `SELECT to_char(session_date, 'YYYY-MM-DD') AS date, duration_seconds 
         FROM work_sessions 
         WHERE user_id = $1 AND session_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      ),
      calculateStreaks(userId)
    ]);

    // Aggregate by date
    tasksRes.rows.forEach((t) => {
      const day = days.find((d) => d.date === t.date);
      if (day) {
        day.totalTasks++;
        if (t.status === 'completed') day.completedTasks++;
        day.plannedMinutes += t.estimated_minutes || 0;
      }
    });

    sessionsRes.rows.forEach((s) => {
      const day = days.find((d) => d.date === s.date);
      if (day) {
        day.workedMinutes += Math.round((s.duration_seconds || 0) / 60);
      }
    });

    days.forEach((day) => {
      day.plannedHours = Number((day.plannedMinutes / 60).toFixed(1));
      day.actualHours = Number((day.workedMinutes / 60).toFixed(1));
      day.productivityRate = day.plannedMinutes > 0
        ? Math.min(100, Math.round((day.workedMinutes / day.plannedMinutes) * 100))
        : (day.workedMinutes > 0 ? 100 : 0);
    });

    const totalTasks = days.reduce((sum, d) => sum + d.totalTasks, 0);
    const completedTasks = days.reduce((sum, d) => sum + d.completedTasks, 0);
    const totalPlannedMinutes = days.reduce((sum, d) => sum + d.plannedMinutes, 0);
    const totalWorkedMinutes = days.reduce((sum, d) => sum + d.workedMinutes, 0);
    const avgDailyWorkedMinutes = Math.round(totalWorkedMinutes / 7);

    // Identify most and least productive days
    const sortedByWork = [...days].sort((a, b) => b.workedMinutes - a.workedMinutes);
    const mostProductiveDay = sortedByWork[0]?.workedMinutes > 0 ? sortedByWork[0].dayName : 'None';
    const leastProductiveDay = sortedByWork[6]?.dayName || 'None';

    return res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        days,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalPlannedMinutes,
        totalWorkedMinutes,
        avgDailyWorkedMinutes,
        mostProductiveDay,
        leastProductiveDay,
        currentStreak: streaks.currentStreak
      }
    });
  } catch (error) {
    console.error('getWeeklyReport error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve weekly report' });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month are required' });
    }

    const userId = req.user.id;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [tasksRes, sessionsRes, catRes, streaks] = await Promise.all([
      pool.query(
        `SELECT to_char(task_date, 'YYYY-MM-DD') AS date, status, estimated_minutes 
         FROM tasks 
         WHERE user_id = $1 AND task_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      ),
      pool.query(
        `SELECT to_char(session_date, 'YYYY-MM-DD') AS date, duration_seconds 
         FROM work_sessions 
         WHERE user_id = $1 AND session_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      ),
      pool.query(
        `SELECT c.name, c.color_hex, SUM(s.duration_seconds) AS total_seconds 
         FROM work_sessions s 
         JOIN categories c ON s.category_id = c.id 
         WHERE s.user_id = $1 AND s.session_date BETWEEN $2 AND $3 
         GROUP BY c.name, c.color_hex 
         ORDER BY total_seconds DESC`,
        [userId, startDate, endDate]
      ),
      calculateStreaks(userId)
    ]);

    const totalTasks = tasksRes.rows.length;
    const completedTasks = tasksRes.rows.filter((t) => t.status === 'completed').length;
    const totalWorkedMinutes = sessionsRes.rows.reduce(
      (sum, s) => sum + Math.round((s.duration_seconds || 0) / 60),
      0
    );
    const avgDailyWorkedMinutes = Math.round(totalWorkedMinutes / lastDay);

    // Build category distribution data
    const categoryDistribution = catRes.rows.map((c) => {
      const minutes = Math.round(parseInt(c.total_seconds, 10) / 60);
      return {
        name: c.name,
        color: c.color_hex,
        minutes,
        hours: Number((minutes / 60).toFixed(1)),
        percentage: totalWorkedMinutes > 0 ? Math.round((minutes / totalWorkedMinutes) * 100) : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        year: y,
        month: m,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalWorkedMinutes,
        avgDailyWorkedMinutes,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        categoryDistribution,
        mostProductiveCategory: categoryDistribution[0]?.name || 'None'
      }
    });
  } catch (error) {
    console.error('getMonthlyReport error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve monthly report' });
  }
};