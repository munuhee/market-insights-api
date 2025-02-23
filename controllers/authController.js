const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const generateVerificationCode = require('../utils/generateVerificationCode');
const generateTokenAndSetCookie = require('../utils/generateTokenAndSetCookie');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessfulEmail
} = require('../utils/mailtrap/emails');

exports.register = async (req, res, next) => {
  try {
    console.log("Received request body:", req.body); // Debugging log

    const { username, firstName, lastName, email, password } = req.body;

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
    const verificationCode = generateVerificationCode();

    // Create a new user
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role : 'free_user',
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 0 * 30 * 60 * 1000 // 30 minutes
    });

    // Save the user to the database
    const user = await newUser.save();

    // jwt
    generateTokenAndSetCookie(res, user);

    // Send the verification email
    await sendVerificationEmail(user.email, verificationCode);

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
  const { verificationCode } = req.body;
  try {
    // Find the user by verification token
    const user = await User.findOne({ verificationCode });

    if (!user) {
      const error = new Error('Invalid verification code');
      error.statusCode = 400;
      throw error;
    }

    // Check if the verification token has expired
    if (user.verificationCodeExpiresAt < Date.now()) {
      const error = new Error('Verification token has expired');
      error.statusCode = 400;
      throw error;
    }

    // Update the user's verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;

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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set the password reset token and expiration time
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    // Update the user's password reset token and expiration time
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send the password reset email
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user by password reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiresAt: { $gt: Date.now() }
     });

    if (!user) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    await sendResetSuccessfulEmail(user.email);

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, user});
  } catch (err) {
    next(err);
  }
};