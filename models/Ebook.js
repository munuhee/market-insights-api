const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ebook', ebookSchema);