const User = require('../models/User');

exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;

    if (!userData.username || !userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      const error = new Error('Username, first name, last name, email, and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create(userData);

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
