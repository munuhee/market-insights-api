const mongoose = require('mongoose');

const fundamentalAnalysisSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  analysisType: { type: String, required: true },
  description: { type: String, required: true },
  conclusion: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FundamentalAnalysis', fundamentalAnalysisSchema);