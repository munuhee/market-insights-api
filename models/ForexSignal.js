const mongoose = require('mongoose');

const forexSignalSchema = new mongoose.Schema({
  currencyPair: { type: String, required: true },
  action: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  takeProfit: { type: Number, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ForexSignal', forexSignalSchema);