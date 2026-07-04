import * as alertRepository from '../repositories/alertRepository.js';
import { logActivity } from '../utils/auditLogger.js';

export const createAlert = async (alertData, actorId, ipAddress) => {
  const alert = await alertRepository.createAlert(alertData);
  await logActivity({
    userId: actorId,
    action: 'CREATE',
    module: 'Alert',
    ipAddress,
    metadata: { alertId: alert._id, farmerId: alert.farmerId }
  });
  return alert;
};

export const getAlertById = async (id, actorId, ipAddress) => {
  const alert = await alertRepository.findById(id);
  if (!alert) {
    throw new Error('Alert not found');
  }
  await logActivity({
    userId: actorId,
    action: 'READ',
    module: 'Alert',
    ipAddress,
    metadata: { alertId: id }
  });
  return alert;
};

export const updateAlert = async (id, updateData, actorId, ipAddress) => {
  const alert = await alertRepository.updateAlert(id, updateData);
  if (!alert) {
    throw new Error('Alert not found');
  }
  await logActivity({
    userId: actorId,
    action: 'UPDATE',
    module: 'Alert',
    ipAddress,
    metadata: { alertId: id, updatedFields: Object.keys(updateData) }
  });
  return alert;
};

export const deleteAlert = async (id, actorId, ipAddress) => {
  const alert = await alertRepository.deleteAlert(id);
  if (!alert) {
    throw new Error('Alert not found');
  }
  await logActivity({
    userId: actorId,
    action: 'DELETE',
    module: 'Alert',
    ipAddress,
    metadata: { alertId: id, type: 'HARD_DELETE' }
  });
  return alert;
};

export const markAlertAsRead = async (id, actorId, ipAddress) => {
  const alert = await alertRepository.markAsRead(id);
  if (!alert) {
    throw new Error('Alert not found');
  }
  await logActivity({
    userId: actorId,
    action: 'UPDATE',
    module: 'Alert',
    ipAddress,
    metadata: { alertId: id, operation: 'MARK_READ' }
  });
  return alert;
};

export const getUnreadAlerts = async (farmerId, actorId, ipAddress) => {
  const alerts = await alertRepository.getUnreadAlerts(farmerId);
  await logActivity({
    userId: actorId,
    action: 'READ_UNREAD',
    module: 'Alert',
    ipAddress,
    metadata: { farmerId }
  });
  return alerts;
};

export const getAlerts = async (queryParams, actorId, ipAddress) => {
  const result = await alertRepository.getAlerts(queryParams);
  await logActivity({
    userId: actorId,
    action: 'READ_ALL',
    module: 'Alert',
    ipAddress,
    metadata: { filters: queryParams }
  });
  return result;
};
