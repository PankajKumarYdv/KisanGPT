import * as assessmentRepository from '../repositories/assessmentRepository.js';
import { logActivity } from '../utils/auditLogger.js';

export const createAssessment = async (assessmentData, actorId, ipAddress) => {
  const assessment = await assessmentRepository.createAssessment(assessmentData);
  await logActivity({
    userId: actorId,
    action: 'CREATE',
    module: 'Assessment',
    ipAddress,
    metadata: { assessmentId: assessment._id, farmerId: assessment.farmerId }
  });
  return assessment;
};

export const getAssessmentById = async (id, actorId, ipAddress) => {
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    throw new Error('Assessment record not found');
  }
  await logActivity({
    userId: actorId,
    action: 'READ',
    module: 'Assessment',
    ipAddress,
    metadata: { assessmentId: id }
  });
  return assessment;
};

export const updateAssessment = async (id, updateData, actorId, ipAddress) => {
  const assessment = await assessmentRepository.updateAssessment(id, updateData);
  if (!assessment) {
    throw new Error('Assessment record not found');
  }
  await logActivity({
    userId: actorId,
    action: 'UPDATE',
    module: 'Assessment',
    ipAddress,
    metadata: { assessmentId: id, updatedFields: Object.keys(updateData) }
  });
  return assessment;
};

export const deleteAssessment = async (id, actorId, ipAddress) => {
  const assessment = await assessmentRepository.deleteAssessment(id);
  if (!assessment) {
    throw new Error('Assessment record not found');
  }
  await logActivity({
    userId: actorId,
    action: 'DELETE',
    module: 'Assessment',
    ipAddress,
    metadata: { assessmentId: id, type: 'HARD_DELETE' }
  });
  return assessment;
};

export const getAssessments = async (queryParams, actorId, ipAddress) => {
  const result = await assessmentRepository.getAssessments(queryParams);
  await logActivity({
    userId: actorId,
    action: 'READ_ALL',
    module: 'Assessment',
    ipAddress,
    metadata: { filters: queryParams }
  });
  return result;
};
