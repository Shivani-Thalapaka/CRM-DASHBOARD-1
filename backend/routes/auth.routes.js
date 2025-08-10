// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db'); // database connection
require('dotenv').config();
// Register Route
router.post('/register', async (req, res) => {
 const { username, email, password } = req.body;
 try {
   const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
   if (existingUser.rows.length > 0) {
     return res.status(400).json({ message: 'User already exists' });
   }
   const hashedPassword = await bcrypt.hash(password, 10);
   const result = await db.query(
     'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
     [username, email, hashedPassword]
   );
   const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
   res.status(201).json({ token });
 } catch (err) {
   console.error(err.message);
   res.status(500).json({ message: 'Server error' });
 }
});
// Login Route
router.post('/login', async (req, res) => {
 const { email, password } = req.body;
 try {
   const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
   if (user.rows.length === 0) {
     return res.status(400).json({ message: 'Invalid credentials' });
   }
   const validPassword = await bcrypt.compare(password, user.rows[0].password);
   if (!validPassword) {
     return res.status(400).json({ message: 'Invalid credentials' });
   }
   const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
   res.status(200).json({ token });
 } catch (err) {
   console.error(err.message);
   res.status(500).json({ message: 'Server error' });
 }
});
module.exports = router;