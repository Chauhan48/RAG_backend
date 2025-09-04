const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

module.exports = common;