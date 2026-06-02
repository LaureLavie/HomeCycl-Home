import jwt from'jsonwebtoken';
import bcrypt from'bcrypt';

export const generateToken = (user) => {
  return jwt.sign({ id: user.id_authentification, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const hashPassword = async (password) => await bcrypt.hash(password, 10);
export const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);

