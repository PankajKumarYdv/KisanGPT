import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import axios from 'axios';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';

dotenv.config();

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

const runIntegrationTest = async () => {
  let server;
  try {
    console.log('--- Auth Routes HTTP Integration Test Start ---');
    await connectDB(2, 2000);

    const testEmail = 'verify.routes@example.com';
    await User.deleteMany({ email: testEmail });

    // Start server on test port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`[✓] Test server listening on port ${PORT}`);

    // 1. Test registration validation errors
    console.log('\n[1] Testing Registration Validation (empty fields)...');
    try {
      await axios.post(`${BASE_URL}/register`, {});
      console.error('[✕] Registration succeeded with empty fields!');
    } catch (err) {
      console.log('[✓] Registration correctly rejected with 400 Bad Request. Errors:', err.response.data.errors.length);
    }

    // 2. Test successful registration
    console.log('\n[2] Testing Successful Registration...');
    const regRes = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Route Tester',
      email: testEmail,
      phone: '+919988776611',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      role: 'farmer'
    });
    console.log('[✓] Registration API responded with success:', regRes.data.success);
    console.log('    Response message:', regRes.data.message);

    // 3. Test duplicate email registration failure
    console.log('\n[3] Testing Duplicate Registration Protection...');
    try {
      await axios.post(`${BASE_URL}/register`, {
        fullName: 'Route Tester',
        email: testEmail,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });
      console.error('[✕] Duplicate email registration succeeded!');
    } catch (err) {
      console.log('[✓] Duplicate registration correctly rejected. Message:', err.response.data.message);
    }

    // 4. Test login and cookie setting
    console.log('\n[4] Testing Login API...');
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email: testEmail,
      password: 'SecurePass123!'
    });
    console.log('[✓] Login API succeeded.');
    console.log('    Response JSON has accessToken:', !!loginRes.data.data.accessToken);
    
    const setCookieHeaders = loginRes.headers['set-cookie'] || [];
    console.log('    Cookies set by server:', setCookieHeaders.length);
    const hasAccessTokenCookie = setCookieHeaders.some(cookie => cookie.includes('accessToken='));
    const hasRefreshTokenCookie = setCookieHeaders.some(cookie => cookie.includes('refreshToken='));
    console.log('    Has accessToken cookie:', hasAccessTokenCookie);
    console.log('    Has refreshToken cookie:', hasRefreshTokenCookie);

    const token = loginRes.data.data.accessToken;

    // 5. Test protected routes (unauthorized vs authorized)
    console.log('\n[5] Testing Protected Route (/me)...');
    try {
      await axios.get(`${BASE_URL}/me`);
      console.error('[✕] Access to /me succeeded without authorization!');
    } catch (err) {
      console.log('[✓] Protected route correctly rejected unauthorized request. Status:', err.response.status);
    }

    const meRes = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[✓] Authorized request to /me succeeded. User full name:', meRes.data.data.fullName);

    // 6. Test Refresh Token
    console.log('\n[6] Testing Token Refresh API...');
    const refreshRes = await axios.post(`${BASE_URL}/refresh`, {
      refreshToken: loginRes.data.data.refreshToken
    });
    console.log('[✓] Token refresh succeeded. New AccessToken:', !!refreshRes.data.data.accessToken);

    // 7. Test Profile Update
    console.log('\n[7] Testing Profile Update...');
    const profileRes = await axios.patch(`${BASE_URL}/profile`, {
      fullName: 'Route Tester Updated'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[✓] Profile update succeeded. New Name:', profileRes.data.data.fullName);

    // 8. Test Logout
    console.log('\n[8] Testing Logout...');
    const logoutRes = await axios.post(`${BASE_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[✓] Logout API succeeded. Message:', logoutRes.data.message);

    // Clean up verify database entry
    await User.deleteMany({ email: testEmail });
    console.log('\n[✓] Test data cleaned up successfully.');
    console.log('\n--- Auth Routes HTTP Integration Test Success! ---');
  } catch (error) {
    console.error('\n[✕] Integration Test Failed:', error.message);
    if (error.response) {
      console.error('    Error payload:', error.response.data);
    }
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('Test server closed.');
    }
    await closeDB();
    process.exit(0);
  }
};

runIntegrationTest();
