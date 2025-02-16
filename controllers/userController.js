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

    const userId = user.id;
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await new Promise((resolve, reject) => {
      User.findById(id, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
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
    const user = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
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

exports.updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    await new Promise((resolve, reject) => {
      User.updateSubscriptionStatus(userId, isActive, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    res.status(200).json({ message: 'Subscription status updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = require('../config/db');

    await new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Users WHERE id = ?';
      db.run(sql, [id], function (err) {
        if (err) return reject(err);
        if (this.changes === 0) {
          const error = new Error('User not found');
          error.statusCode = 404;
          return reject(error);
        }
        resolve();
      });
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
