const db = require('../models/db');
const { validateRequired } = require('../utils/validation');

// Create stage
exports.createStage = async (req, res) => {
  const { lead_id, stage_name } = req.body;
  
  // Validate input data
  const leadValidation = validateRequired(lead_id, 'Lead ID');
  const stageValidation = validateRequired(stage_name, 'Stage name');
  
  const errors = [];
  if (!leadValidation.isValid) errors.push(leadValidation.message);
  if (!stageValidation.isValid) errors.push(stageValidation.message);
  if (lead_id && isNaN(lead_id)) errors.push('Lead ID must be a valid number');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  try {
    // Check if lead exists
    const leadCheck = await db.query('SELECT id FROM leads WHERE id = $1', [lead_id]);
    if (leadCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const result = await db.query(
      'INSERT INTO stages (lead_id, stage_name) VALUES ($1, $2) RETURNING *',
      [lead_id, stage_name]
    );
    
    res.status(201).json({
      success: true,
      message: 'Stage created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Get all stages with lead and customer details
exports.getAllStages = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, l.lead_source, l.status as lead_status, l.value as lead_value,
             c.name as customer_name, c.email as customer_email
      FROM stages s 
      LEFT JOIN leads l ON s.lead_id = l.id 
      LEFT JOIN customers c ON l.customer_id = c.id 
      ORDER BY s.created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Get stage by ID
exports.getStageById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT s.*, l.lead_source, l.status as lead_status, l.value as lead_value,
             c.name as customer_name, c.email as customer_email
      FROM stages s 
      LEFT JOIN leads l ON s.lead_id = l.id 
      LEFT JOIN customers c ON l.customer_id = c.id 
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Get stages by lead ID
exports.getStagesByLead = async (req, res) => {
  const { lead_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM stages WHERE lead_id = $1 ORDER BY created_at DESC',
      [lead_id]
    );
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Update stage
exports.updateStage = async (req, res) => {
  const { id } = req.params;
  const { stage_name } = req.body;
  
  // Validate input data
  const stageValidation = validateRequired(stage_name, 'Stage name');
  if (!stageValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [stageValidation.message]
    });
  }

  try {
    // Check if stage exists
    const stageCheck = await db.query('SELECT id FROM stages WHERE id = $1', [id]);
    if (stageCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage not found'
      });
    }

    const result = await db.query(
      'UPDATE stages SET stage_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [stage_name, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Stage updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Delete stage
exports.deleteStage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM stages WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Stage deleted successfully',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};