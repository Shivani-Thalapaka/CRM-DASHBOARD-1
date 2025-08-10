const pool = require('../models/db');

const getTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as customer_name 
      FROM tasks t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      ORDER BY t.due_date ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTask = async (req, res) => {
  const { customer_id, title, description, due_date, priority } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (customer_id, title, description, due_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, title, description, due_date, priority]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, due_date = $3, priority = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, due_date, priority, status, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };