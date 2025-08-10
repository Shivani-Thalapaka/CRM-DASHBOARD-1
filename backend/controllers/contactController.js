const db = require('../models/db');
// Create contact
exports.createContact = async (req, res) => {
 const { customer_id, contact_type, contact_value, is_primary } = req.body;
 try {
   const result = await db.query(
     'INSERT INTO contacts (customer_id, contact_type, contact_value, is_primary) VALUES ($1, $2, $3, $4) RETURNING *',
     [customer_id, contact_type, contact_value, is_primary || false]
   );
   res.status(201).json({ success: true, data: result.rows[0] });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};
// Get all contacts
exports.getAllContacts = async (req, res) => {
 try {
   const result = await db.query(`
     SELECT co.*, c.name as customer_name, c.email as customer_email
     FROM contacts co 
     LEFT JOIN customers c ON co.customer_id = c.id 
     ORDER BY co.created_at DESC
   `);
   res.status(200).json({ success: true, data: result.rows });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};
// Update contact
exports.updateContact = async (req, res) => {
 const { id } = req.params;
 const { contact_type, contact_value, is_primary } = req.body;
 try {
   const result = await db.query(
     'UPDATE contacts SET contact_type = $1, contact_value = $2, is_primary = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
     [contact_type, contact_value, is_primary || false, id]
   );
   res.status(200).json({ success: true, message: 'Contact updated', data: result.rows[0] });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};
// Delete contact
exports.deleteContact = async (req, res) => {
 const { id } = req.params;
 try {
   const result = await db.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
   if (result.rows.length === 0) {
     return res.status(404).json({ success: false, error: 'Contact not found' });
   }
   res.status(200).json({ success: true, message: 'Contact deleted' });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};

// Get contact by ID
exports.getContactById = async (req, res) => {
 const { id } = req.params;
 try {
   const result = await db.query(`
     SELECT co.*, c.name as customer_name, c.email as customer_email
     FROM contacts co 
     LEFT JOIN customers c ON co.customer_id = c.id 
     WHERE co.id = $1
   `, [id]);
   if (result.rows.length === 0) {
     return res.status(404).json({ success: false, error: 'Contact not found' });
   }
   res.status(200).json({ success: true, data: result.rows[0] });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};

// Get contacts by customer
exports.getContactsByCustomer = async (req, res) => {
 const { customer_id } = req.params;
 try {
   const result = await db.query(`
     SELECT co.*, c.name as customer_name, c.email as customer_email
     FROM contacts co 
     LEFT JOIN customers c ON co.customer_id = c.id 
     WHERE co.customer_id = $1
   `, [customer_id]);
   res.status(200).json({ success: true, data: result.rows });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
};

// Get contacts by type
exports.getContactsByType = async (req, res) => {
 const { type } = req.params;
 try {
   const result = await db.query(`
     SELECT co.*, c.name as customer_name, c.email as customer_email
     FROM contacts co 
     LEFT JOIN customers c ON co.customer_id = c.id 
     WHERE co.contact_type = $1
   `, [type]);
   res.status(200).json({ success: true, data: result.rows });
 } catch (err) {
   res.status(500).json({ success: false, error: err.message });
 }
 };