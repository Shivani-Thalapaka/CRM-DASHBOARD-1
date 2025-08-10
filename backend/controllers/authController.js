const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const register = async (req, res) => {
 const { username, email, password } = req.body;
 console.log('=== REGISTRATION REQUEST ===');
 console.log('Request body:', req.body);
 try {
   const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
   if (userExists.rows.length > 0) {
     console.log('Email already exists:', email);
     return res.status(400).json({ message: 'Email already registered' });
   }
   const hashedPassword = await bcrypt.hash(password, 10);
   const newUser = await pool.query(
     'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
     [username, email, hashedPassword]
   );
   console.log('User registered successfully:', email);
   res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
 } catch (err) {
   console.error('Registration error:', err.message);
   res.status(500).json({ message: 'Server error', error: err.message });
 }
};
const login = async (req, res) => {
 const { email, password } = req.body;
 console.log('=== LOGIN REQUEST ===');
 console.log('Request body:', req.body);
 console.log('Email:', email);
 console.log('Password length:', password ? password.length : 'undefined');
 try {
   const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
   console.log('User found:', user.rows.length > 0);
   if (user.rows.length === 0) {
     console.log('User not found in database');
     return res.status(400).json({ message: 'Invalid credentials' });
   }
   console.log('Stored password hash:', user.rows[0].password);
   const validPassword = await bcrypt.compare(password, user.rows[0].password);
   console.log('Password comparison result:', validPassword);
   if (!validPassword) {
     console.log('Invalid password for user:', email);
     return res.status(400).json({ message: 'Invalid credentials' });
   }
   const token = jwt.sign({ id: user.rows[0].id, userId: user.rows[0].id }, process.env.JWT_SECRET, {
     expiresIn: '24h',
   });
   console.log('Login successful for:', email);
   res.json({ message: 'Login successful', token, email: user.rows[0].email });
 } catch (err) {
   console.error('Login error:', err.message);
   res.status(500).json({ message: 'Server error', error: err.message });
 }
};
module.exports = { register, login };