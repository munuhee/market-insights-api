const SentimentAnalysis = require('../models/SentimentAnalysis');

// Create a new sentiment analysis
exports.createSentimentAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { asset, sentiment, confidenceLevel, description } = req.body;
    const sentimentAnalysis = new SentimentAnalysis({
      asset,
      sentiment,
      confidenceLevel,
      description,
      userId
    });
    const savedAnalysis = await sentimentAnalysis.save();
    res.status(201).json({ message: 'Sentiment analysis created successfully', sentimentId: savedAnalysis._id });
  } catch (err) {
    next(err);
  }
};

// Get paginated sentiment analyses
exports.getAllSentimentAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await SentimentAnalysis.countDocuments();
    const analyses = await SentimentAnalysis.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      analyses,
    });
  } catch (err) {
    next(err);
  }
};

// Get sentiment analysis by ID
exports.getSentimentAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = await SentimentAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({ message: 'Sentiment analysis not found' });
    }
    res.status(200).json(analysis);
  } catch (err) {
    next(err);
  }
};

// Update a sentiment analysis by ID
exports.updateSentimentAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { asset, sentiment, confidenceLevel, description } = req.body;
    const updatedAnalysis = await SentimentAnalysis.findByIdAndUpdate(
      id,
      { asset, sentiment, confidenceLevel, description },
      { new: true }
    );
    if (!updatedAnalysis) {
      return res.status(404).json({ message: 'Sentiment analysis not found' });
    }
    res.status(200).json({ message: 'Sentiment analysis updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete a sentiment analysis by ID
exports.deleteSentimentAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedAnalysis = await SentimentAnalysis.findByIdAndDelete(id);
    if (!deletedAnalysis) {
      return res.status(404).json({ message: 'Sentiment analysis not found' });
    }
    res.status(200).json({ message: 'Sentiment analysis deleted successfully' });
  } catch (err) {
    next(err);
  }
};