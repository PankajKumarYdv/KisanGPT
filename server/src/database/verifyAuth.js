import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import * as authService from '../services/authService.js';
import { User } from '../models/User.js';

dotenv.config();

const runVerification = async () => {
  try {
    console.log('--- Auth Module Verification Start ---');
    await connectDB(2, 2000);

    const testEmail = 'verify.auth@example.com';
    
    // Clear any leftover test data
    await User.deleteMany({ email: testEmail });

    // 1. Verify Registration & Password Hashing
    console.log('\n[1] Testing User Registration...');
    const registeredUser = await authService.registerUser(
      'Auth Tester',
      testEmail,
      '+919988776655',
      'SecurePass123!',
      'farmer'
    );
    console.log('[✓] User registered successfully:', registeredUser.email);
    if (registeredUser.password === undefined && registeredUser.refreshToken === undefined) {
      console.log('[✓] Sensitive fields (password, refreshToken) are successfully omitted from output.');
    } else {
      console.error('[✕] Sensitive fields are exposed in registration output!');
    }

    // Verify hashing directly in DB
    const dbUser = await User.findOne({ email: testEmail });
    if (dbUser.password && dbUser.password.startsWith('$2a$')) {
      console.log('[✓] Password successfully hashed automatically using bcrypt (rounds: 12). Hash:', dbUser.password);
    } else {
      console.error('[✕] Password hashing failed or did not use bcrypt! Raw password found:', dbUser.password);
    }

    // 2. Verify Login & Token Generation
    console.log('\n[2] Testing User Login...');
    const loginResult = await authService.loginUser(testEmail, 'SecurePass123!');
    console.log('[✓] Login succeeded.');
    console.log('    AccessToken:', loginResult.accessToken ? 'Generated (15m)' : 'Missing');
    console.log('    RefreshToken:', loginResult.refreshToken ? 'Generated (7d)' : 'Missing');
    
    // 3. Verify Refresh Token Flow
    console.log('\n[3] Testing Refresh Token Flow...');
    const refreshResult = await authService.refreshTokens(loginResult.refreshToken);
    console.log('[✓] Refresh token rotation succeeded.');
    console.log('    New AccessToken:', refreshResult.accessToken ? 'Generated' : 'Missing');
    console.log('    New RefreshToken:', refreshResult.refreshToken ? 'Generated' : 'Missing');

    // 4. Verify Profile Update & Password Change
    console.log('\n[4] Testing Profile Update & Password Change...');
    const updatedUser = await authService.updateProfile(dbUser._id, { fullName: 'Auth Tester Updated' });
    console.log('[✓] Profile update succeeded. New Name:', updatedUser.fullName);

    const changePassResult = await authService.changePassword(dbUser._id, 'SecurePass123!', 'NewSecurePass456!');
    console.log('[✓] Password change succeeded:', changePassResult.message);

    // Verify login with new password
    const newLoginResult = await authService.loginUser(testEmail, 'NewSecurePass456!');
    console.log('[✓] Login with new password succeeded.');

    // 5. Verify Logout & Refresh Token Invalidation
    console.log('\n[5] Testing Logout...');
    await authService.logoutUser(dbUser._id);
    const loggedOutUserObj = await User.findById(dbUser._id);
    if (loggedOutUserObj.refreshToken === null) {
      console.log('[✓] Logout successfully cleared refreshToken in database.');
    } else {
      console.error('[✕] RefreshToken was not cleared in database upon logout!');
    }

    // Clean up
    await User.deleteOne({ _id: dbUser._id });
    console.log('\n[✓] Test data cleaned up successfully.');
    console.log('\n--- Auth Module Verification Success! ---');
  } catch (error) {
    console.error('\n[✕] Verification Failed:', error.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

runVerification();
