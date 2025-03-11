const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // Duration in months
  description: { type: String, required: true },
});

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Subscription, SubscriptionPlan };
