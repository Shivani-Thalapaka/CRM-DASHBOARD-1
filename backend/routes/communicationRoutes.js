const express = require('express');
const router = express.Router();
const { sendEmail, sendSMS, makeCall, getCommunicationHistory, getCustomerContacts } = require('../controllers/communicationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

router.post('/email', sendEmail);
router.post('/sms', sendSMS);
router.post('/call', makeCall);
router.get('/history/:customer_id', getCommunicationHistory);
router.get('/history', getCommunicationHistory);
router.get('/contacts/:customer_id', getCustomerContacts);

module.exports = router;