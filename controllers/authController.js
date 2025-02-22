const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateVerificationToken = require('../utils/generateVerificationToken');
const generateTokenAndSetCookie = require('../utils/generateTokenAndSetCookie');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/mailtrap/emails');

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

    // Generate a verification code
    const verificationToken = generateVerificationToken();

    // Create a new user
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Save the user to the database
    const user = await newUser.save();

    // jwt
    generateTokenAndSetCookie(res, user);

    // Send the verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.body;
  try {
    // Find the user by verification token
    const user = await User.findOne({ verificationToken });

    if (!user) {
      const error = new Error('Invalid verification token');
      error.statusCode = 400;
      throw error;
    }

    // Check if the verification token has expired
    if (user.verificationTokenExpiresAt < Date.now()) {
      const error = new Error('Verification token has expired');
      error.statusCode = 400;
      throw error;
    }

    // Update the user's verification status
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // Save the user to the database
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined
      }
     });
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

    // Generate and set the token
    const token = generateTokenAndSetCookie(res, user);

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        ...user._doc,
        password: undefined
      },
      token
    });

  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
