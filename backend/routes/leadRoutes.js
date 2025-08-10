const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Routes
router.get('/', authenticateToken, leadController.getAllLeads);
router.get('/:id', authenticateToken, leadController.getLeadById);
router.post('/', authenticateToken, leadController.createLead);
router.put('/:id', authenticateToken, leadController.updateLead);
router.delete('/:id', authenticateToken, leadController.deleteLead);
module.exports = router;