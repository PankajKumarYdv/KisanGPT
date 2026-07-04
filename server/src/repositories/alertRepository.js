import { Alert } from '../models/Alert.js';

export const createAlert = async (alertData) => {
  return Alert.create(alertData);
};

export const findById = async (id) => {
  return Alert.findById(id).populate({
    path: 'farmerId',
    populate: { path: 'userId', select: 'fullName email phone' }
  });
};

export const updateAlert = async (id, updateData) => {
  return Alert.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('farmerId');
};

export const deleteAlert = async (id) => {
  return Alert.findByIdAndDelete(id);
};

export const markAsRead = async (id) => {
  return Alert.findByIdAndUpdate(
    id,
    { $set: { isRead: true } },
    { new: true }
  ).populate('farmerId');
};

export const getUnreadAlerts = async (farmerId) => {
  const query = { isRead: false };
  if (farmerId) {
    query.farmerId = farmerId;
  }
  return Alert.find(query).sort({ createdAt: -1 }).populate('farmerId');
};

export const getAlerts = async ({ page, limit, farmerId, severity }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (farmerId) {
    query.farmerId = farmerId;
  }
  if (severity) {
    query.severity = severity;
  }

  const totalRecords = await Alert.countDocuments(query);
  const records = await Alert.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('farmerId');

  return {
    records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords,
    },
  };
};
