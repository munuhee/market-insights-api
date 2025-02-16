const ForexSignal = require('../models/ForexSignal');

// Create a new forex signal
exports.createForexSignal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currencyPair, action, entryPrice, stopLoss, takeProfit, description } = req.body;
    const signal = new ForexSignal({
      currencyPair,
      action,
      entryPrice,
      stopLoss,
      takeProfit,
      description,
      userId
    });
    const savedSignal = await signal.save();
    res.status(201).json({ message: 'Forex signal created successfully', signalId: savedSignal._id });
  } catch (err) {
    next(err);
  }
};

// Get all forex signals
exports.getAllForexSignals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalSignals = await ForexSignal.countDocuments();
    const signals = await ForexSignal.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      totalSignals,
      totalPages: Math.ceil(totalSignals / limit),
      currentPage: page,
      signals
    });
  } catch (err) {
    next(err);
  }
};

// Get a forex signal by ID
exports.getForexSignalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const signal = await ForexSignal.findById(id);
    if (!signal) {
      return res.status(404).json({ message: 'Forex signal not found' });
    }
    res.status(200).json(signal);
  } catch (err) {
    next(err);
  }
};

// Update a forex signal
exports.updateForexSignal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currencyPair, action, entryPrice, stopLoss, takeProfit, description } = req.body;
    const updatedSignal = await ForexSignal.findByIdAndUpdate(
      id,
      { currencyPair, action, entryPrice, stopLoss, takeProfit, description },
      { new: true }
    );
    if (!updatedSignal) {
      return res.status(404).json({ message: 'Forex signal not found' });
    }
    res.status(200).json({ message: 'Forex signal updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete a forex signal
exports.deleteForexSignal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedSignal = await ForexSignal.findByIdAndDelete(id);
    if (!deletedSignal) {
      return res.status(404).json({ message: 'Forex signal not found' });
    }
    res.status(200).json({ message: 'Forex signal deleted successfully' });
  } catch (err) {
    next(err);
  }
};