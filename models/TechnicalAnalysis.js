const mongoose = require('mongoose');

const technicalAnalysisSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  timeframe: { type: String, required: true },
  analysis: { type: String, required: true },
  conclusion: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TechnicalAnalysis', technicalAnalysisSchema);