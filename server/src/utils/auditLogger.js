import { ActivityLog } from '../models/ActivityLog.js';

export const logActivity = async ({ userId, action, module, ipAddress = '', metadata = {} }) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      module,
      ipAddress,
      metadata
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error.message);
  }
};
