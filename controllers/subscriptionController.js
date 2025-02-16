const User = require("../models/User");
const Subscription = require("../models/Subscription");
const intasend = require("../config/intasend");

exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    const userId = req.user.id;
    const { firstName, lastName, email } = req.user;

    // Define subscription prices
    const planPrices = {
      monthly: process.env.MONTHLY_PRICE,
      semi_annual: process.env.SEMI_ANNUAL_PRICE,
      yearly: process.env.ANNUAL_PRICE,
    };

    if (!planPrices[plan]) {
      return res.status(400).json({ error: "Invalid subscription plan" });
    }

    // Generate checkout link using IntaSend
    let collection = intasend.collection();
    const response = await collection.charge({
      first_name: firstName,
      last_name: lastName,
      email,
      amount: planPrices[plan],
      currency: "USD",
      api_ref: `sub_${userId}_${Date.now()}`,
      redirect_url: "https://website.com/subscription-success",
    });

    if (!response || !response.url) {
      return res.status(500).json({ error: "Failed to create payment link" });
    }

    // Store the subscription in the database (initially inactive)
    const startDate = new Date();
    let endDate = new Date();
    if (plan === "monthly") endDate.setMonth(startDate.getMonth() + 1);
    if (plan === "semi_annual") endDate.setMonth(startDate.getMonth() + 6);
    if (plan === "yearly") endDate.setFullYear(startDate.getFullYear() + 1);

    const subscription = new Subscription({
      userId,
      plan,
      startDate,
      endDate,
      isActive: false, // Initially inactive
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

exports.handleWebhook = async (req, res) => {
  try {
    const { api_ref, status } = req.body;

    if (status === "COMPLETE") {
      // Extract userId from api_ref (format: sub_userId_timestamp)
      const userId = api_ref.split("_")[1];

      // Find the subscription and update its status
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      subscription.isActive = true;
      await subscription.save();

      // Update the user's role to 'subscriber'
      await User.findByIdAndUpdate(userId, { role: 'subscriber' });

      res.json({ message: "Subscription activated successfully" });
    } else {
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
