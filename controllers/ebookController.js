const Ebook = require('../models/Ebook');

// Create a new ebook
exports.createEbook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, filePath, category } = req.body;
    const newEbook = new Ebook({
      title,
      description,
      filePath,
      category,
      userId,
    });
    const savedEbook = await newEbook.save();
    res.status(201).json(savedEbook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all ebooks
exports.getAllEbooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Ebook.countDocuments();
    const ebooks = await Ebook.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ebooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single ebook by ID
exports.getEbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const ebook = await Ebook.findById(id);
    if (!ebook) {
      return res.status(404).json({ message: 'Ebook not found' });
    }
    res.status(200).json(ebook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an ebook by ID
exports.updateEbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, filePath, category } = req.body;
    const updatedEbook = await Ebook.findByIdAndUpdate(
      id,
      { title, description, filePath, category },
      { new: true, runValidators: true }
    );
    if (!updatedEbook) {
      return res.status(404).json({ message: 'Ebook not found' });
    }
    res.status(200).json(updatedEbook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an ebook by ID
exports.deleteEbook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEbook = await Ebook.findByIdAndDelete(id);
    if (!deletedEbook) {
      return res.status(404).json({ message: 'Ebook not found' });
    }
    res.status(200).json({ message: 'Ebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
