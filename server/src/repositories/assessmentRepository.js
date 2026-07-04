import { Assessment } from '../models/Assessment.js';

export const createAssessment = async (assessmentData) => {
  return Assessment.create(assessmentData);
};

export const findById = async (id) => {
  return Assessment.findById(id).populate({
    path: 'farmerId',
    populate: { path: 'userId', select: 'fullName email phone' }
  });
};

export const updateAssessment = async (id, updateData) => {
  return Assessment.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('farmerId');
};

export const deleteAssessment = async (id) => {
  return Assessment.findByIdAndDelete(id);
};

export const getAssessments = async ({ page, limit, farmerId }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (farmerId) {
    query.farmerId = farmerId;
  }

  const totalRecords = await Assessment.countDocuments(query);
  const records = await Assessment.find(query)
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
