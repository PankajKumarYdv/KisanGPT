const loginAttempts = new Map();

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const timeframe = 15 * 60 * 1000; // 15 minutes window
  const maxLimit = 5; // Maximum 5 attempts

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  // Filter out expired attempts
  const attempts = loginAttempts.get(ip).filter(timestamp => now - timestamp < timeframe);
  attempts.push(now);
  loginAttempts.set(ip, attempts);

  if (attempts.length > maxLimit) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      errors: ['Rate limit exceeded']
    });
  }
  next();
};
