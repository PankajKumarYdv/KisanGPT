import * as authService from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCookieOptions = (type = 'access') => {
  const isProd = process.env.NODE_ENV === 'production';
  const expires = type === 'access'
    ? new Date(Date.now() + 15 * 60 * 1000) // 15m
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax',
    expires,
  };
};

export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, password, role } = req.body;
  const user = await authService.registerUser(fullName, email, phone, password, role);
  return new ApiResponse(201, 'User registered successfully', user).send(res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

  res.cookie('accessToken', accessToken, getCookieOptions('access'));
  res.cookie('refreshToken', refreshToken, getCookieOptions('refresh'));

  return new ApiResponse(200, 'Login successful', { accessToken, refreshToken, user }).send(res);
});

export const refresh = asyncHandler(async (req, res, next) => {
  let token = null;

  // Try reading cookie first
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    token = cookies.refreshToken;
  }

  // Try reading request body next
  if (!token) {
    token = req.body.refreshToken;
  }

  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(token);

  res.cookie('accessToken', accessToken, getCookieOptions('access'));
  res.cookie('refreshToken', newRefreshToken, getCookieOptions('refresh'));

  return new ApiResponse(200, 'Token refreshed successfully', { accessToken, refreshToken: newRefreshToken }).send(res);
});

export const logout = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await authService.logoutUser(req.user.id);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return new ApiResponse(200, 'Logged out successfully').send(res);
});

export const me = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  const user = await authService.getCurrentUser(req.user.id);
  return new ApiResponse(200, 'Current user profile fetched successfully', user).send(res);
});

export const changePassword = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  return new ApiResponse(200, result.message).send(res);
});

export const profile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  const userObj = await authService.updateProfile(req.user.id, req.body);
  return new ApiResponse(200, 'Profile updated successfully', userObj).send(res);
});
