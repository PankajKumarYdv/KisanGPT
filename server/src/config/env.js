import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENWEATHERMAP_API_KEY',
  'DATAGOV_API_KEY',
];

export const validateEnv = () => {
  const missing = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`\n[CRITICAL ERROR] Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please define them in your environment or a .env file.\n');
    process.exit(1);
  }
};
