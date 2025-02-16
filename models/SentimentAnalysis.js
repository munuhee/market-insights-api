const mongoose = require('mongoose');

const sentimentAnalysisSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  sentiment: { type: String, required: true },
  confidenceLevel: { type: Number },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SentimentAnalysis', sentimentAnalysisSchema);