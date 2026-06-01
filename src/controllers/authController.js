const authService = require('../services/authService');

const signup = async (req, res) => {
  try {
    const user = await authService.registerClient(req.body);
    res.status(201).json({ message: "Utilisateur créé", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signup };