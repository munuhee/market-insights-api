const express = require('express');
const router = express.Router();
const financialAdviceController = require('../controllers/financialAdviceController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create a new Financial Advice
router.post('/', authorize(['admin']), financialAdviceController.createFinancialAdvice);

// Get all Financial Advices
router.get('/', authorize(['admin', 'subscriber', 'free_user']), financialAdviceController.getAllFinancialAdvices);

// Get Financial Advice by ID
router.get('/:id', authorize(['admin', 'subscriber', 'free_user']), financialAdviceController.getFinancialAdviceById);

// Update Financial Advice by ID
router.put('/:id', authorize(['admin']), financialAdviceController.updateFinancialAdvice);

// Delete Financial Advice by ID
router.delete('/:id', authorize(['admin']), financialAdviceController.deleteFinancialAdvice);

module.exports = router;