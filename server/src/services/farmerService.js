import * as farmerRepository from '../repositories/farmerRepository.js';
import { logActivity } from '../utils/auditLogger.js';

export const createFarmer = async (farmerData, actorId, ipAddress) => {
  const farmer = await farmerRepository.createFarmer(farmerData);
  await logActivity({
    userId: actorId,
    action: 'CREATE',
    module: 'Farmer',
    ipAddress,
    metadata: { farmerId: farmer._id, farmName: farmer.farmName }
  });
  return farmer;
};

export const getFarmerById = async (id, actorId, ipAddress) => {
  const farmer = await farmerRepository.findById(id);
  if (!farmer) {
    throw new Error('Farmer profile not found');
  }
  await logActivity({
    userId: actorId,
    action: 'READ',
    module: 'Farmer',
    ipAddress,
    metadata: { farmerId: id }
  });
  return farmer;
};

export const updateFarmer = async (id, updateData, actorId, ipAddress) => {
  const farmer = await farmerRepository.updateFarmer(id, updateData);
  if (!farmer) {
    throw new Error('Farmer profile not found or already deleted');
  }
  await logActivity({
    userId: actorId,
    action: 'UPDATE',
    module: 'Farmer',
    ipAddress,
    metadata: { farmerId: id, updatedFields: Object.keys(updateData) }
  });
  return farmer;
};

export const deleteFarmer = async (id, actorId, ipAddress) => {
  const farmer = await farmerRepository.softDeleteFarmer(id);
  if (!farmer) {
    throw new Error('Farmer profile not found or already deleted');
  }
  await logActivity({
    userId: actorId,
    action: 'DELETE',
    module: 'Farmer',
    ipAddress,
    metadata: { farmerId: id, type: 'SOFT_DELETE' }
  });
  return farmer;
};

export const getFarmers = async (queryParams, actorId, ipAddress) => {
  const result = await farmerRepository.getFarmers(queryParams);
  await logActivity({
    userId: actorId,
    action: 'READ_ALL',
    module: 'Farmer',
    ipAddress,
    metadata: { filters: queryParams }
  });
  return result;
};
