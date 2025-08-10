const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected routes
router.get('/', authenticateToken, contactController.getAllContacts);
router.get('/:id', authenticateToken, contactController.getContactById);
router.get('/customer/:customer_id', authenticateToken, contactController.getContactsByCustomer);
router.get('/type/:type', authenticateToken, contactController.getContactsByType);
router.post('/', authenticateToken, contactController.createContact);
router.put('/:id', authenticateToken, contactController.updateContact);
router.delete('/:id', authenticateToken, contactController.deleteContact);
module.exports = router;