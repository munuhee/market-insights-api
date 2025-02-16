const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create a new ebook
router.post('/', authorize(['admin']), ebookController.createEbook);

// Get all ebooks
router.get('/', authorize(['admin', 'subscriber', 'free_user']), ebookController.getAllEbooks);

// Get a single ebook by ID
router.get('/:id', authorize(['admin', 'subscriber']), ebookController.getEbookById);

// Update an ebook by ID
router.put('/:id', authorize(['admin']), ebookController.updateEbook);

// Delete an ebook by ID
router.delete('/:id', authorize(['admin']), ebookController.deleteEbook);

module.exports = router;