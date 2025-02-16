const mongoose = require('mongoose');

const financialAdviceSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  adviceType: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FinancialAdvice', financialAdviceSchema);