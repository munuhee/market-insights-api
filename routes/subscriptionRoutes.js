const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticate } = require('../middleware/authMiddleware');

// Route to create a subscription (generate payment link)
router.post("/create", authenticate, subscriptionController.createSubscription);

// Webhook route to update subscription status
router.post("/webhook", subscriptionController.handleWebhook);

module.exports = router;