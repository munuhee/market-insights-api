const { Subscription, SubscriptionPlan } = require("../models/Subscription");
const User = require("../models/User");
const intasend = require("../config/intasend");

/** =============================
 *  SUBSCRIPTION PLANS CONTROLLERS
 *  =============================
 */

// Create a new subscription plan
exports.createPlan = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;

    // Check if the plan already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ error: "Plan already exists" });
    }

    const plan = new SubscriptionPlan({ name, price, duration, description });
    await plan.save();

    res.status(201).json({ message: "Subscription plan created successfully", plan });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all subscription plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json(plans);
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single subscription plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    res.json(plan);
  } catch (error) {
    console.error("Fetch plan by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a subscription plan
exports.updatePlan = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { name, price, duration, description },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    res.json({ message: "Subscription plan updated successfully", plan });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a subscription plan
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    res.json({ message: "Subscription plan deleted successfully" });
  } catch (error) {
    console.error("Delete plan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** =============================
 *  USER SUBSCRIPTIONS CONTROLLERS
 *  =============================
 */

// Create a new subscription (checkout link)
exports.createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const { firstName, lastName, email } = req.user;

    // Find the subscription plan from the database
    const plan = await SubscriptionPlan.findOne({ _id: planId });
    if (!plan) {
      return res.status(400).json({ error: "Invalid subscription plan" });
    }

    // Generate checkout link using IntaSend
    let collection = intasend.collection();
    const response = await collection.charge({
      first_name: firstName,
      last_name: lastName,
      email,
      amount: plan.price,
      currency: "USD",
      api_ref: `sub_${userId}_${Date.now()}`,
      redirect_url: "https://website.com/subscription-success",
    });

    if (!response || !response.url) {
      return res.status(500).json({ error: "Failed to create payment link" });
    }

    // Calculate subscription duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + plan.duration);

    // Store the subscription in the database
    const subscription = new Subscription({
      userId,
      plan: plan._id,
      startDate,
      endDate,
      isActive: false,
    });

    await subscription.save();

    res.json({
      message: "Payment link created successfully",
      payment_url: response.url,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle payment webhook
exports.handleWebhook = async (req, res) => {
  try {
    const { api_ref, status } = req.body;

    if (status !== "COMPLETE") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Extract userId from api_ref (format: sub_userId_timestamp)
    const userId = api_ref.split("_")[1];

    // Find the most recent inactive subscription for the user
    const subscription = await Subscription.findOne({ userId, isActive: false }).sort({ startDate: -1 });

    if (!subscription) {
      return res.status(404).json({ error: "No inactive subscription found" });
    }

    // Activate subscription
    subscription.isActive = true;
    await subscription.save();

    // Update the user's role to 'subscriber'
    await User.findByIdAndUpdate(userId, { role: 'subscriber' });

    res.json({ message: "Subscription activated successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all user subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id }).populate("plan");
    res.json(subscriptions);
  } catch (error) {
    console.error("Fetch user subscriptions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel a subscription (Soft Delete)
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription || subscription.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: "Subscription not found or unauthorized" });
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
