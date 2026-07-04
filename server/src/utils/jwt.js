import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production');
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production');
};
