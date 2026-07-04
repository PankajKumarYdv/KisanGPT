import * as userRepository from '../repositories/userRepository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const registerUser = async (fullName, email, phone, password, role) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email address already in use');
  }

  const user = await userRepository.createUser({
    fullName,
    email,
    phone,
    password,
    role
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};

export const loginUser = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await userRepository.updateRefreshToken(user._id, refreshToken);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { accessToken, refreshToken, user: userObj };
};

export const refreshTokens = async (token) => {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new Error('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await userRepository.updateRefreshToken(user._id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId) => {
  return userRepository.clearRefreshToken(userId);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new Error('Incorrect old password');
  }

  await userRepository.updatePassword(userId, newPassword);
  return { message: 'Password updated successfully' };
};

export const updateProfile = async (userId, profileData) => {
  const updatedUser = await userRepository.updateProfile(userId, profileData);
  if (!updatedUser) {
    throw new Error('User not found');
  }
  const userObj = updatedUser.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};

export const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};
