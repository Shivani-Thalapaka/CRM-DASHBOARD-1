const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected routes
router.get('/', authenticateToken, stageController.getAllStages);
router.get('/:id', authenticateToken, stageController.getStageById);
router.get('/lead/:lead_id', authenticateToken, stageController.getStagesByLead);
router.post('/', authenticateToken, stageController.createStage);
router.put('/:id', authenticateToken, stageController.updateStage);
router.delete('/:id', authenticateToken, stageController.deleteStage);
module.exports = router;