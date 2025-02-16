const FinancialAdvice = require('../models/FinancialAdvice');

// Create a new Financial Advice
exports.createFinancialAdvice = async (req, res, next) => {
  try {
    const { asset, adviceType, description } = req.body;
    const userId = req.user.id;

    const financialAdvice = new FinancialAdvice({
      asset,
      adviceType,
      description,
      userId
    });

    const savedAdvice = await financialAdvice.save();
    res.status(201).json({
      message: 'Financial advice created successfully',
      adviceId: savedAdvice._id
    });
  } catch (err) {
    next(err);
  }
};

// Get paginated financial advices
exports.getAllFinancialAdvices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await FinancialAdvice.countDocuments();
    const advices = await FinancialAdvice.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      advices,
    });
  } catch (err) {
    next(err);
  }
};

// Get Financial Advice by ID
exports.getFinancialAdviceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const advice = await FinancialAdvice.findById(id);
    if (!advice) {
      return res.status(404).json({ message: 'Financial advice not found' });
    }
    res.status(200).json(advice);
  } catch (err) {
    next(err);
  }
};

// Update Financial Advice by ID
exports.updateFinancialAdvice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { asset, adviceType, description } = req.body;

    const updatedAdvice = await FinancialAdvice.findByIdAndUpdate(
      id,
      { asset, adviceType, description },
      { new: true }
    );

    if (!updatedAdvice) {
      return res.status(404).json({ message: 'Financial advice not found' });
    }
    res.status(200).json({ message: 'Financial advice updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete Financial Advice by ID
exports.deleteFinancialAdvice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedAdvice = await FinancialAdvice.findByIdAndDelete(id);
    if (!deletedAdvice) {
      return res.status(404).json({ message: 'Financial advice not found' });
    }
    res.status(200).json({ message: 'Financial advice deleted successfully' });
  } catch (err) {
    next(err);
  }
};