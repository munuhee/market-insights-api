const cron = require('node-cron');
const { Subscription } = require('../models/Subscription');
const User = require('../models/User');

// Schedule a task to run every day at midnight
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    // Find all subscriptions that have ended
    const expiredSubscriptions = await Subscription.find({
      endDate: { $lte: now },
      isActive: true,
    });

    // Update the user's role to 'free_user' for each expired subscription
    for (const subscription of expiredSubscriptions) {
      await User.findByIdAndUpdate(subscription.userId, { role: 'free_user' });

      // Mark the subscription as inactive
      subscription.isActive = false;
      await subscription.save();
    }

    console.log(`Updated ${expiredSubscriptions.length} users to free_user.`);
  } catch (error) {
    console.error('Error updating expired subscriptions:', error);
  }
});
