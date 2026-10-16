import pool from '../config/db.js';

export const getReflection = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      `SELECT id, accomplishments, challenges, tomorrow_focus, general_notes, 
              to_char(reflection_date, 'YYYY-MM-DD') AS reflection_date
       FROM daily_reflections
       WHERE user_id = $1 AND reflection_date = $2`,
      [req.user.id, date]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('getReflection error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reflection' });
  }
};

export const saveReflection = async (req, res) => {
  try {
    const { date } = req.params;
    const { accomplishments = '', challenges = '', tomorrowFocus = '', generalNotes = '' } = req.body;

    const result = await pool.query(
      `INSERT INTO daily_reflections (
         user_id, reflection_date, accomplishments, challenges, tomorrow_focus, general_notes, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, reflection_date)
       DO UPDATE SET
         accomplishments = EXCLUDED.accomplishments,
         challenges = EXCLUDED.challenges,
         tomorrow_focus = EXCLUDED.tomorrow_focus,
         general_notes = EXCLUDED.general_notes,
         updated_at = NOW()
       RETURNING id, accomplishments, challenges, tomorrow_focus, general_notes, to_char(reflection_date, 'YYYY-MM-DD') AS reflection_date`,
      [req.user.id, date, accomplishments, challenges, tomorrowFocus, generalNotes]
    );

    return res.status(200).json({
      success: true,
      message: 'Reflection saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('saveReflection error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save reflection' });
  }
};