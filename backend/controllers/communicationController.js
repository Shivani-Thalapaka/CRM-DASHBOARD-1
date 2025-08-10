const pool = require('../models/db');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email configuration - Mock or Real
let emailTransporter;
if (process.env.EMAIL_MODE === 'mock') {
  // Mock email transporter (no real email sent)
  emailTransporter = {
    sendMail: async (options) => {
      console.log('📧 MOCK EMAIL SENT:');
      console.log('From:', options.from);
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Message:', options.text);
      console.log('---');
      return { messageId: 'mock_' + Date.now() };
    }
  };
} else {
  // Real SMTP transporter
  emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Twilio configuration - only initialize if credentials are provided
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Get customer contact details
const getCustomerContacts = async (req, res) => {
  const { customer_id } = req.params;
  try {
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
    const contacts = await pool.query('SELECT * FROM contacts WHERE customer_id = $1', [customer_id]);
    
    if (customer.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const customerData = customer.rows[0];
    const contactData = contacts.rows;
    
    // Organize contact information
    const contactInfo = {
      customer: customerData,
      emails: [customerData.email, ...contactData.filter(c => c.contact_type === 'email').map(c => c.contact_value)],
      phones: [customerData.phone, ...contactData.filter(c => c.contact_type === 'phone').map(c => c.contact_value)],
      addresses: contactData.filter(c => c.contact_type === 'address').map(c => c.contact_value),
      social: contactData.filter(c => c.contact_type === 'social').map(c => c.contact_value)
    };
    
    res.json({ success: true, data: contactInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendEmail = async (req, res) => {
  const { customer_id, recipient, subject, message } = req.body;
  try {
    // Send email to customer's email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Message from CRM System</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This email was sent from your CRM Dashboard system.</p>
        </div>
      `,
      text: message
    };
    
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Store in communication history
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, subject, message, status, external_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [customer_id, 'email', recipient, subject, message, 'sent', info.messageId]
    );
    
    res.json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    // Store failed attempt
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, subject, message, status, response) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [customer_id, 'email', recipient, subject, message, 'failed', error.message]
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendSMS = async (req, res) => {
  const { customer_id, recipient, message } = req.body;
  try {
    let smsResult;
    
    if (process.env.SMS_MODE === 'mock') {
      // Mock SMS sending
      console.log('📱 MOCK SMS SENT:');
      console.log('To:', recipient);
      console.log('Message:', message);
      console.log('---');
      smsResult = { sid: 'mock_sms_' + Date.now() };
    } else {
      // Real SMS via Twilio
      smsResult = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient
      });
    }
    
    // Store in communication history
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, message, status, external_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, 'sms', recipient, message, 'sent', smsResult.sid]
    );
    
    res.json({ success: true, message: 'SMS sent successfully', sid: smsResult.sid });
  } catch (error) {
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, message, status, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, 'sms', recipient, message, 'failed', error.message]
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

const makeCall = async (req, res) => {
  const { customer_id, recipient, message } = req.body;
  try {
    let call;
    
    if (process.env.CALL_MODE === 'mock') {
      // Mock call
      console.log('📞 MOCK CALL MADE:');
      console.log('To:', recipient);
      console.log('Message:', message || 'Hello, this is a call from your CRM system.');
      console.log('---');
      call = { sid: 'mock_call_' + Date.now() };
    } else {
      // Real call via Twilio Voice
      call = await twilioClient.calls.create({
        twiml: `<Response><Say>${message || 'Hello, this is a call from your CRM system.'}</Say></Response>`,
        to: recipient,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    }
    
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, message, status, external_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, 'call', recipient, message, 'completed', call.sid]
    );
    
    res.json({ success: true, message: 'Call initiated successfully', sid: call.sid });
  } catch (error) {
    await pool.query(
      'INSERT INTO communication_history (customer_id, communication_type, recipient, message, status, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, 'call', recipient, message, 'failed', error.message]
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCommunicationHistory = async (req, res) => {
  const { customer_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT ch.*, c.name as customer_name 
      FROM communication_history ch 
      LEFT JOIN customers c ON ch.customer_id = c.id 
      WHERE ch.customer_id = $1 OR $1 IS NULL
      ORDER BY ch.created_at DESC
    `, [customer_id || null]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendEmail, sendSMS, makeCall, getCommunicationHistory, getCustomerContacts };