const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);
router.use(authorize(['admin']));

router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.get('/email/:email', userController.getUserByEmail);
router.put('/:userId/subscription', userController.updateSubscriptionStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
