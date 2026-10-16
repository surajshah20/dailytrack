import pool from '../config/db.js';

export const instantiateRecurringTasks = async (userId, targetDateStr) => {
  const targetDate = new Date(targetDateStr);
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const dayOfMonth = targetDate.getDate();

  // Fetch all active recurring rules for this user
  const rulesRes = await pool.query(
    `SELECT * FROM recurring_rules 
     WHERE user_id = $1 AND is_active = true 
       AND start_date <= $2 
       AND (end_date IS NULL OR end_date >= $2)`,
    [userId, targetDateStr]
  );

  for (const rule of rulesRes.rows) {
    let matches = false;

    if (rule.frequency === 'daily') {
      matches = true;
    } else if (rule.frequency === 'weekday') {
      matches = dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (rule.frequency === 'weekly') {
      matches = Array.isArray(rule.days_of_week) ? rule.days_of_week.includes(dayOfWeek) : true;
    } else if (rule.frequency === 'monthly') {
      matches = rule.day_of_month === dayOfMonth;
    }

    if (matches) {
      // Idempotent insertion using our UNIQUE partial index
      await pool.query(
        `INSERT INTO tasks (
           user_id, category_id, recurring_rule_id, title, description,
           task_date, estimated_minutes, priority, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         ON CONFLICT (user_id, recurring_rule_id, task_date) WHERE recurring_rule_id IS NOT NULL 
         DO NOTHING`,
        [
          userId,
          rule.category_id,
          rule.id,
          rule.title,
          rule.description,
          targetDateStr,
          rule.estimated_minutes,
          rule.priority
        ]
      );
    }
  }
};