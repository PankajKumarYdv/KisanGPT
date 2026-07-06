import mongoose from 'mongoose';
import { User } from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisangpt';

// Event listeners for database connection lifecycle
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open to the database.');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose default connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose default connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongoose default connection reestablished.');
});

export const seedDemoUser = async () => {
  try {
    const demoEmail = 'demo@kisangpt.ai';
    const existing = await User.findOne({ email: demoEmail });
    if (!existing) {
      console.log('Seeding demo user...');
      await User.create({
        fullName: 'Demo Farmer',
        email: demoEmail,
        password: 'Demo@123', // User model pre-save hook handles hashing
        phone: '+919876543211',
        role: 'farmer',
        isVerified: true
      });
      console.log('Demo user seeded successfully!');
    } else {
      console.log('Demo user already exists in the database.');
    }
  } catch (error) {
    console.error('Error seeding demo user:', error.message);
  }
};

export const connectDB = async (retryCount = 5, retryInterval = 5000) => {
  let attempt = 1;
  while (attempt <= retryCount) {
    try {
      console.log(`Connecting to MongoDB (Attempt ${attempt}/${retryCount})...`);
      await mongoose.connect(MONGODB_URI);
      await seedDemoUser();
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed: ${error.message}`);
      attempt++;
      if (attempt <= retryCount) {
        console.log(`Waiting ${retryInterval / 1000}s before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }
  console.error('All database connection attempts failed. Exiting process.');
  process.exit(1);
};

// Graceful shutdown helper
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose default connection disconnected through app termination.');
  } catch (error) {
    console.error(`Error closing Mongoose connection: ${error.message}`);
  }
};

// Listen for system signals to shutdown gracefully
process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Starting graceful shutdown.');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Starting graceful shutdown.');
  await closeDB();
  process.exit(0);
});
