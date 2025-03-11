const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Subscription Plan Routes
router.post("/plans",  authorize(['admin']), subscriptionController.createPlan);
router.get("/plans", subscriptionController.getPlans);
router.get("/plans/:id", subscriptionController.getPlanById);
router.put("/plans/:id",  authorize(['admin']), subscriptionController.updatePlan);
router.delete("/plans/:id", subscriptionController.deletePlan);

// User Subscription Routes
router.post("/", subscriptionController.createSubscription);
router.get("/", subscriptionController.getUserSubscriptions);
router.post("/webhook", subscriptionController.handleWebhook);
router.delete("/:id", subscriptionController.cancelSubscription);

module.exports = router;
