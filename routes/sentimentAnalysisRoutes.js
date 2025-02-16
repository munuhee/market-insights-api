const express = require('express');
const router = express.Router();
const sentimentAnalysisController = require('../controllers/sentimentAnalysisController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create a new sentiment analysis
router.post('/', authorize(['admin']),  sentimentAnalysisController.createSentimentAnalysis);

// Get all sentiment analyses
router.get('/', authorize(['admin', 'subscriber', 'free_user']), sentimentAnalysisController.getAllSentimentAnalyses);

// Get a single sentiment analysis by ID
router.get('/:id', authorize(['admin', 'subscriber', 'free_user']), sentimentAnalysisController.getSentimentAnalysisById);

// Update a sentiment analysis by ID
router.put('/:id', authorize(['admin']), sentimentAnalysisController.updateSentimentAnalysis);

// Delete a sentiment analysis by ID
router.delete('/:id', authorize(['admin']), sentimentAnalysisController.deleteSentimentAnalysis);

module.exports = router;
