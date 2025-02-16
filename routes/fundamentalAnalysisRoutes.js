const express = require('express');
const router = express.Router();
const fundamentalAnalysisController = require('../controllers/fundamentalAnalysisController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create a new fundamental analysis
router.post('/', authorize(['admin']), fundamentalAnalysisController.createFundamentalAnalysis);

// Get all fundamental analyses
router.get('/', authorize(['admin', 'subscriber', 'free_user']), fundamentalAnalysisController.getAllFundamentalAnalyses);

// Get a single fundamental analysis by ID
router.get('/:id', authorize(['admin', 'subscriber', 'free_user']), fundamentalAnalysisController.getFundamentalAnalysisById);

// Update a fundamental analysis by ID
router.put('/:id', authorize(['admin']), fundamentalAnalysisController.updateFundamentalAnalysis);

// Delete a fundamental analysis by ID
router.delete('/:id', authorize(['admin']), fundamentalAnalysisController.deleteFundamentalAnalysis);

module.exports = router;
