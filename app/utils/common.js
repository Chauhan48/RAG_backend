const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const common = {};

// hash password;
common.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

module.exports = common;