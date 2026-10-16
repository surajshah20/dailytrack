import pool from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, color_hex, icon, is_archived, created_at 
       FROM categories 
       WHERE user_id = $1 AND is_archived = false 
       ORDER BY name ASC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, colorHex = '#6366F1', icon = 'folder' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, color_hex, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, color_hex, icon, created_at`,
      [req.user.id, name.trim(), colorHex, icon]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A category with this name already exists' });
    }
    console.error('createCategory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, colorHex, icon } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           color_hex = COALESCE($2, color_hex),
           icon = COALESCE($3, icon),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, color_hex, icon, updated_at`,
      [name?.trim(), colorHex, icon, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('updateCategory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE categories SET is_archived = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({ success: true, message: 'Category archived successfully' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};