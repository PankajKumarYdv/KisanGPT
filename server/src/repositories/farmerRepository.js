import { Farmer } from '../models/Farmer.js';
import { User } from '../models/User.js';

export const createFarmer = async (farmerData) => {
  return Farmer.create(farmerData);
};

export const findById = async (id, includeDeleted = false) => {
  const query = { _id: id };
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  return Farmer.findOne(query).populate('userId', 'fullName email phone avatar');
};

export const findByUserId = async (userId) => {
  return Farmer.findOne({ userId, isDeleted: false }).populate('userId', 'fullName email phone avatar');
};

export const updateFarmer = async (id, updateData) => {
  return Farmer.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email phone avatar');
};

export const softDeleteFarmer = async (id) => {
  return Farmer.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
};

export const getFarmers = async ({ page, limit, search, cropType, state, district, sortBy, sortOrder, userId }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = { isDeleted: false };
  if (userId) {
    query.userId = userId;
  }

  // Search filter
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const matchedUsers = await User.find({ fullName: searchRegex }).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    query.$or = [
      { farmName: searchRegex },
      { district: searchRegex },
      { state: searchRegex },
      { cropType: searchRegex },
      { userId: { $in: userIds } },
    ];
  }

  // Exact match filters
  if (cropType) query.cropType = cropType;
  if (state) query.state = state;
  if (district) query.district = district;

  // Sorting
  let sortObj = {};
  const direction = sortOrder === 'asc' ? 1 : -1;

  if (sortBy === 'newest') {
    sortObj = { createdAt: -1 };
  } else if (sortBy === 'oldest') {
    sortObj = { createdAt: 1 };
  } else if (sortBy === 'landSize') {
    sortObj = { landSize: direction };
  } else if (sortBy === 'annualIncome') {
    sortObj = { annualIncome: direction };
  } else {
    sortObj = { createdAt: direction };
  }

  const totalRecords = await Farmer.countDocuments(query);
  const records = await Farmer.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .populate('userId', 'fullName email phone avatar');

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
