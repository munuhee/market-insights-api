const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

exports.register = async (req, res, next) => {
  try {
    console.log("Received request body:", req.body); // Debugging log

    const { username, firstName, lastName, email, password, role = 'admin' } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Username, first name, last name, email, and password are required' });
    }

    // Check if the user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      const error = new Error('User with this username already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, firstName, lastName, email, password: hashedPassword, role });

    // Save the user to the database
    const user = await newUser.save();

    // Create the JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email,
        username,
        firstName,
        lastName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('Authentication failed: User not found');
      error.statusCode = 401;
      throw error;
    }

    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error('Authentication failed: Incorrect password');
      error.statusCode = 401;
      throw error;
    }

    // Sign the token
    const token = jwt.sign({ id: user._id, username: user.username, email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};