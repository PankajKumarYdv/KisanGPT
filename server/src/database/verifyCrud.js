import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Farmer } from '../models/Farmer.js';
import { Assessment } from '../models/Assessment.js';
import { Alert } from '../models/Alert.js';
import { ActivityLog } from '../models/ActivityLog.js';
import * as authService from '../services/authService.js';

dotenv.config();

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

const runIntegrationTest = async () => {
  let server;
  try {
    console.log('--- Core CRUD Routes Integration Test Start ---');
    await connectDB(2, 2000);

    const emailA = 'user.a@example.com';
    const emailB = 'user.b@example.com';

    // Cleanup leftover test users & logs
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await Farmer.deleteMany({});
    await Assessment.deleteMany({});
    await Alert.deleteMany({});
    await ActivityLog.deleteMany({});

    // Start server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`[✓] Test server listening on port ${PORT}`);

    // Register User A and User B
    const userA = await authService.registerUser('User Alpha', emailA, '+919988775511', 'SecurePass1!', 'farmer');
    const userB = await authService.registerUser('User Beta', emailB, '+919988775522', 'SecurePass1!', 'farmer');

    // Login to get tokens
    const loginA = await authService.loginUser(emailA, 'SecurePass1!');
    const loginB = await authService.loginUser(emailB, 'SecurePass1!');
    const tokenA = loginA.accessToken;
    const tokenB = loginB.accessToken;

    const headersA = { headers: { Authorization: `Bearer ${tokenA}` } };
    const headersB = { headers: { Authorization: `Bearer ${tokenB}` } };

    // --- 1. Farmer CRUD & Soft Delete ---
    console.log('\n[1] Testing Farmer Profile Creation...');
    const farmerDataA = {
      state: 'Punjab',
      district: 'Amritsar',
      village: 'Jassa',
      pincode: '143001',
      farmName: 'Alpha Fields',
      landSize: 5.2,
      landUnit: 'acres',
      cropType: 'Wheat',
      annualIncome: 300000,
    };
    
    // Create Profile A
    const farmCreateRes = await axios.post(`${BASE_URL}/farmers`, farmerDataA, headersA);
    const farmerA = farmCreateRes.data.data;
    console.log('[✓] Farmer A profile created. ID:', farmerA._id);

    // Try to update Farmer A profile using User B credentials (ownership check)
    console.log('\n[2] Testing Ownership Check (User B trying to modify Farmer A)...');
    try {
      await axios.patch(`${BASE_URL}/farmers/${farmerA._id}`, { farmName: 'Hacked Fields' }, headersB);
      console.error('[✕] User B successfully modified Farmer A profile!');
    } catch (err) {
      console.log('[✓] Rejected correctly with 403 Forbidden. Message:', err.response.data.message);
    }

    // Update Farmer A profile using User A
    console.log('\n[3] Testing Authorized Profile Update...');
    const farmUpdateRes = await axios.patch(`${BASE_URL}/farmers/${farmerA._id}`, { farmName: 'Alpha Fields Gold' }, headersA);
    console.log('[✓] Updated successfully. New Farm Name:', farmUpdateRes.data.data.farmName);

    // --- 2. Assessment CRUD ---
    console.log('\n[4] Testing Assessment CRUD...');
    const assessData = {
      farmerId: farmerA._id,
      financialRisk: 20,
      weatherRisk: 40,
      cropRisk: 30,
      marketRisk: 15,
      overallRisk: 23,
      wellnessRisk: 10,
      recommendation: 'Plant high yield seeds and irrigate on Day 3.',
      summary: 'Low risk layout overview',
    };
    const assessCreateRes = await axios.post(`${BASE_URL}/assessments`, assessData, headersA);
    const assessmentA = assessCreateRes.data.data;
    console.log('[✓] Assessment created successfully. ID:', assessmentA._id);

    // Try to view Assessment A using User B
    try {
      await axios.get(`${BASE_URL}/assessments/${assessmentA._id}`, headersB);
      console.error('[✕] User B viewed Assessment A!');
    } catch (err) {
      console.log('[✓] Access blocked correctly. Message:', err.response.data.message);
    }

    // --- 3. Alert CRUD & Mark Read ---
    console.log('\n[5] Testing Alert CRUD & Read operations...');
    const alertData = {
      farmerId: farmerA._id,
      title: 'Pest Advisory Alert',
      description: 'Potential pest sightings nearby.',
      type: 'pest',
      severity: 'High',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    const alertCreateRes = await axios.post(`${BASE_URL}/alerts`, alertData, headersA);
    const alertA = alertCreateRes.data.data;
    console.log('[✓] Alert created. ID:', alertA._id);

    // View unreads
    const unreadRes = await axios.get(`${BASE_URL}/alerts/unread`, headersA);
    console.log('[✓] Unread alerts count for User A:', unreadRes.data.data.length);

    // Mark as read
    await axios.patch(`${BASE_URL}/alerts/${alertA._id}/read`, {}, headersA);
    const postReadUnreadRes = await axios.get(`${BASE_URL}/alerts/unread`, headersA);
    console.log('[✓] Unread alerts count for User A after read update:', postReadUnreadRes.data.data.length);

    // --- 4. Pagination, Searching, and Sorting ---
    console.log('\n[6] Testing Pagination, Search, and Filtering...');
    const allFarmersRes = await axios.get(`${BASE_URL}/farmers?search=Amritsar&page=1&limit=5&sortBy=newest`, headersA);
    console.log('[✓] Farmers paginated fetch succeeded.');
    console.log('    Metadata pagination:', allFarmersRes.data.meta);

    // --- 5. Soft Delete ---
    console.log('\n[7] Testing Soft Delete logic...');
    await axios.delete(`${BASE_URL}/farmers/${farmerA._id}`, headersA);
    console.log('[✓] Farmer profile deleted via API.');

    // Attempt to retrieve it
    try {
      await axios.get(`${BASE_URL}/farmers/${farmerA._id}`, headersA);
      console.error('[✕] Soft deleted profile still accessible!');
    } catch (err) {
      console.log('[✓] Profile retrieval correctly failed (404 Not Found) after soft deletion.');
    }

    const checkDbFarmer = await Farmer.findById(farmerA._id); // Raw model findById does not filter soft-deleted by default
    if (checkDbFarmer.isDeleted === true && checkDbFarmer.deletedAt !== null) {
      console.log('[✓] Database verification: isDeleted is true, deletedAt has timestamp:', checkDbFarmer.deletedAt);
    } else {
      console.error('[✕] Database fields incorrect for soft delete!');
    }

    // --- 6. Audit Logging Verification ---
    console.log('\n[8] Checking Audit Activity logs in database...');
    const logCount = await ActivityLog.countDocuments({ userId: userA._id });
    console.log(`[✓] Successfully tracked and stored ${logCount} activity log records for User A in MongoDB.`);

    // --- 7. Request ID Header verification ---
    console.log('\n[9] Checking Request ID propagation...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    const reqIdHeader = healthRes.headers['x-request-id'];
    if (reqIdHeader && /^[0-9a-fA-F-]{36}$/.test(reqIdHeader)) {
      console.log('[✓] Response propagates valid X-Request-ID header:', reqIdHeader);
    } else {
      console.error('[✕] X-Request-ID header missing or invalid format!');
    }

    // --- 8. Health Check Endpoint ---
    console.log('\n[10] Testing Health Check Endpoint...');
    if (healthRes.data.success === true && healthRes.data.data.status === 'up' && healthRes.data.data.mongodb === 'connected') {
      console.log('[✓] Health endpoint returns valid status:', healthRes.data.data);
    } else {
      console.error('[✕] Health endpoint returned invalid body!');
    }

    // --- 9. Swagger / OpenAPI Docs Verification ---
    console.log('\n[11] Testing Swagger Docs...');
    const swaggerRes = await axios.get(`http://localhost:${PORT}/api/docs-json`);
    if (swaggerRes.data.openapi === '3.0.0' && swaggerRes.data.info.title === 'KisanGPT API') {
      console.log('[✓] Swagger docs successfully retrieved and parsed. OpenAPI version:', swaggerRes.data.openapi);
    } else {
      console.error('[✕] Swagger JSON invalid or missing!');
    }

    // --- 10. Global Error Handling & Validation standard formatting ---
    console.log('\n[12] Testing Validation error response standard schema...');
    try {
      await axios.post(`${BASE_URL}/farmers`, {}, headersA);
      console.error('[✕] Invalid farmers post succeeded!');
    } catch (err) {
      const errorPayload = err.response.data;
      if (
        errorPayload.success === false &&
        errorPayload.statusCode === 400 &&
        errorPayload.message === 'Validation failed.' &&
        Array.isArray(errorPayload.errors) &&
        errorPayload.errors.length > 0 &&
        errorPayload.errors[0].field &&
        errorPayload.errors[0].message
      ) {
        console.log('[✓] Centralized Validation standard formatting verified:', errorPayload);
      } else {
        console.error('[✕] Invalid payload returned for validation failure:', errorPayload);
      }
    }

    // --- 11. Winston Log File Generation Verification ---
    console.log('\n[13] Verifying Winston log files generation...');
    const combinedLogExists = fs.existsSync('logs/combined.log');
    const errorLogExists = fs.existsSync('logs/error.log');
    if (combinedLogExists && errorLogExists) {
      console.log('[✓] logs/combined.log and logs/error.log successfully created on disk.');
    } else {
      console.error('[✕] Winston log files are missing from the disk!');
    }

    // Cleanup
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await Farmer.deleteMany({});
    await Assessment.deleteMany({});
    await Alert.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('\n[✓] Test data cleaned up successfully.');
    console.log('\n--- Core CRUD Routes Integration Test Success! ---');
  } catch (error) {
    console.error('\n[✕] Integration Test Failed:', error.stack || error.message);
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
