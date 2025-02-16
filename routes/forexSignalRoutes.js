const express = require('express');
const router = express.Router();
const forexSignalController = require('../controllers/forexSignalController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create a new Forex Signal
router.post('/', authorize(['admin']), forexSignalController.createForexSignal);

// Get all Forex Signals
router.get('/', authorize(['admin', 'subscriber']), forexSignalController.getAllForexSignals);

// Get a single Forex Signal by ID
router.get('/:id', authorize(['admin', 'subscriber']), forexSignalController.getForexSignalById);

// Update a Forex Signal by ID
router.put('/:id', authorize(['admin']), forexSignalController.updateForexSignal);

// Delete a Forex Signal by ID
router.delete('/:id', authorize(['admin']), forexSignalController.deleteForexSignal);

module.exports = router;