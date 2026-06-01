const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
  return jwt.sign({ id: user.id_authentification, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);

module.exports = { generateToken, hashPassword, comparePassword };