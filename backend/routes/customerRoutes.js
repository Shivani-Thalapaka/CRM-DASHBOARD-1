const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerContacts,
  getCustomerLeads
} = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAllCustomers);
router.get('/:id', authenticateToken, getCustomerById);
router.post('/', authenticateToken, addCustomer);
router.put('/:id', authenticateToken, updateCustomer);
router.delete('/:id', authenticateToken, deleteCustomer);
router.get('/:id/contacts', authenticateToken, getCustomerContacts);
router.get('/:id/leads', authenticateToken, getCustomerLeads);
module.exports = router;