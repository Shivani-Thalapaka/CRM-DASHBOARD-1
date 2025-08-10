const pool = require('../models/db');
const { validateCustomer } = require('../utils/validation');

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({
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

// Get customer by ID
const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found' 
      });
    }
    res.json({
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

// Add new customer
const addCustomer = async (req, res) => {
  const { name, email, phone, company, address } = req.body;
  
  // Validate input data
  const validation = validateCustomer({ name, email, phone });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  try {
    // Check for existing email or phone
    const existing = await pool.query(
      'SELECT * FROM customers WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email or phone already exists' 
      });
    }

    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, company, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, company || null, address || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
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

// Update customer
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, address } = req.body;
  
  // Validate input data
  const validation = validateCustomer({ name, email, phone });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  try {
    // Check if customer exists
    const customerCheck = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found' 
      });
    }

    // Check for existing email or phone (excluding current customer)
    const existing = await pool.query(
      'SELECT * FROM customers WHERE (email = $1 OR phone = $2) AND id != $3',
      [email, phone, id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email or phone already exists for another customer' 
      });
    }

    const result = await pool.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3, company = $4, address = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, email, phone, company || null, address || null, id]
    );
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
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

// Delete customer
const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found' 
      });
    }
    res.json({ 
      success: true,
      message: 'Customer deleted successfully',
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

// Get customer's contacts
const getCustomerContacts = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE customer_id = $1 ORDER BY is_primary DESC, created_at DESC',
      [id]
    );
    res.json({
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

// Get customer's leads
const getCustomerLeads = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM leads WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json({
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

module.exports = {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerContacts,
  getCustomerLeads
};