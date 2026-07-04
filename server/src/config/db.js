import mongoose from 'mongoose';

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

export const connectDB = async (retryCount = 5, retryInterval = 5000) => {
  let attempt = 1;
  while (attempt <= retryCount) {
    try {
      console.log(`Connecting to MongoDB (Attempt ${attempt}/${retryCount})...`);
      await mongoose.connect(MONGODB_URI);
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
