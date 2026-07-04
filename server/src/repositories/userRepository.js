import { User } from '../models/User.js';

export const createUser = async (userData) => {
  return User.create(userData);
};

export const findByEmail = async (email) => {
  return User.findOne({ email });
};

export const findById = async (id) => {
  return User.findById(id);
};

export const updateRefreshToken = async (id, token) => {
  return User.findByIdAndUpdate(id, { refreshToken: token }, { new: true });
};

export const clearRefreshToken = async (id) => {
  return User.findByIdAndUpdate(id, { refreshToken: null }, { new: true });
};

export const updatePassword = async (id, hashedPassword) => {
  // Directly set the password so Mongoose pre-save hook handles hashing if needed, 
  // or handle hashing manually. Mongoose save hooks run on .save() but not findByIdAndUpdate by default 
  // unless we hash it beforehand or use save. 
  // Let's retrieve user and save to trigger the User schema password hashing pre-save hook!
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  user.password = hashedPassword; // Pre-save hook will hash it
  return user.save();
};

export const updateProfile = async (id, profileData) => {
  const { fullName, phone, avatar, preferredLanguage } = profileData;
  return User.findByIdAndUpdate(
    id,
    { $set: { fullName, phone, avatar, preferredLanguage } },
    { new: true, runValidators: true }
  );
};
