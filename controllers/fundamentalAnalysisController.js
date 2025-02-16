const FundamentalAnalysis = require('../models/FundamentalAnalysis');

// Create a new fundamental analysis
exports.createFundamentalAnalysis = async (req, res, next) => {
  try {
    const { asset, analysisType, description, conclusion } = req.body;
    const userId = req.user.id;
    const fundamentalAnalysis = new FundamentalAnalysis({
      asset,
      analysisType,
      description,
      conclusion,
      userId
    });
    const savedAnalysis = await fundamentalAnalysis.save();
    res.status(201).json({
      message: 'Fundamental analysis created successfully',
      fundamentalAnalysisId: savedAnalysis._id,
    });
  } catch (err) {
    next(err);
  }
};

// Get paginated fundamental analyses
exports.getAllFundamentalAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await FundamentalAnalysis.countDocuments();
    const analyses = await FundamentalAnalysis.find()
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

// Get fundamental analysis by ID
exports.getFundamentalAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = await FundamentalAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({ message: 'Fundamental analysis not found' });
    }
    res.status(200).json(analysis);
  } catch (err) {
    next(err);
  }
};

// Update a fundamental analysis by ID
exports.updateFundamentalAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { asset, analysisType, description, conclusion } = req.body;
    const updatedAnalysis = await FundamentalAnalysis.findByIdAndUpdate(
      id,
      { asset, analysisType, description, conclusion },
      { new: true }
    );
    if (!updatedAnalysis) {
      return res.status(404).json({ message: 'Fundamental analysis not found' });
    }
    res.status(200).json({ message: 'Fundamental analysis updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete a fundamental analysis by ID
exports.deleteFundamentalAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedAnalysis = await FundamentalAnalysis.findByIdAndDelete(id);
    if (!deletedAnalysis) {
      return res.status(404).json({ message: 'Fundamental analysis not found' });
    }
    res.status(200).json({ message: 'Fundamental analysis deleted successfully' });
  } catch (err) {
    next(err);
  }
};