import pool from '../config/db.js';

export const calculateStreaks = async (userId) => {
  // Query all distinct dates where the user completed a task OR recorded a session
  const result = await pool.query(
    `SELECT DISTINCT activity_date FROM (
       SELECT to_char(task_date, 'YYYY-MM-DD') AS activity_date 
       FROM tasks 
       WHERE user_id = $1 AND status = 'completed'
       
       UNION
       
       SELECT to_char(session_date, 'YYYY-MM-DD') AS activity_date 
       FROM work_sessions 
       WHERE user_id = $1 AND (duration_seconds > 0 OR is_running = true)
     ) AS combined_activity
     ORDER BY activity_date DESC`,
    [userId]
  );

  const activeDates = result.rows.map((r) => r.activity_date);

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  let cursorDate = activeDates.includes(today) ? today : (activeDates.includes(yesterday) ? yesterday : null);

  if (cursorDate) {
    let checkTime = new Date(cursorDate).getTime();
    while (true) {
      const dateStr = new Date(checkTime).toISOString().split('T')[0];
      if (activeDates.includes(dateStr)) {
        currentStreak++;
        checkTime -= 86400000; // Step back 1 day
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let tempStreak = 0;
  let previousTime = null;

  // Process chronological order (oldest to newest)
  const chronological = [...activeDates].reverse();

  for (const dateStr of chronological) {
    const currentTime = new Date(dateStr).getTime();
    if (previousTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currentTime - previousTime) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    previousTime = currentTime;
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: activeDates.length
  };
};