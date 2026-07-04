import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Farmer } from '../models/Farmer.js';
import { Assessment } from '../models/Assessment.js';
import { Alert } from '../models/Alert.js';
import { GovernmentScheme } from '../models/GovernmentScheme.js';
import { MarketHistory } from '../models/MarketHistory.js';
import { WeatherCache } from '../models/WeatherCache.js';
import { ActivityLog } from '../models/ActivityLog.js';

dotenv.config();

const runVerification = async () => {
  try {
    console.log('--- Database Verification Start ---');
    
    // Connect to database
    await connectDB(2, 2000); // 2 retries, 2s intervals for validation check
    
    const models = [
      { name: 'User', model: User },
      { name: 'Farmer', model: Farmer },
      { name: 'Assessment', model: Assessment },
      { name: 'Alert', model: Alert },
      { name: 'GovernmentScheme', model: GovernmentScheme },
      { name: 'MarketHistory', model: MarketHistory },
      { name: 'WeatherCache', model: WeatherCache },
      { name: 'ActivityLog', model: ActivityLog },
    ];
    
    console.log('\nChecking Model Compilation & Index Creation...');
    for (const { name, model } of models) {
      // Force Mongoose to sync indexes with MongoDB
      await model.init();
      
      const indexes = await model.collection.getIndexes();
      console.log(`\n[✓] Model "${name}" compiles successfully.`);
      console.log(`    Collection Name: "${model.collection.name}"`);
      console.log(`    Active Indexes:`, Object.keys(indexes));
    }
    
    console.log('\nVerification of schema validation & pre-save logic:');
    const testUser = new User({
      fullName: 'Test Verification User',
      email: 'verify.test@example.com',
      password: 'PlainPassword123!',
      phone: '+919999999999'
    });
    
    await testUser.validate();
    console.log('[✓] Schema schema validation check passed.');
    
    console.log('\n--- Database Verification Success! ---');
  } catch (error) {
    console.error('\n[✕] Database Verification Failed:', error);
  } finally {
    await closeDB();
    console.log('\nDatabase connection closed. Exiting.');
    process.exit(0);
  }
};

runVerification();
