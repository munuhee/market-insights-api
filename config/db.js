const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Construct the MongoDB URI
    const uri = process.env.MONGODB_URI;
    console.log(uri);
    // Connect to MongoDB
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;