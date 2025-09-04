const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const common = {};

// hash password;
common.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

// Compare plain password with hashed password
common.comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

common.convertToMongoDbObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
}

common.generateToken = (payload) => {
  return jwt.sign(payload, config.TOKEN_SECRET, { expiresIn: '24h' });
};

common.decryptToken = (token) => {
  try {
    return jwt.verify(token, config.TOKEN_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = common;