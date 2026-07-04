import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null indicates unauthenticated action or system event
    },
    action: {
      type: String,
      required: [true, 'Action description is required'],
      trim: true,
    },
    module: {
      type: String,
      required: [true, 'Module identifier is required'],
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log generation timestamp
  }
);

// Indexes for administrative query filtering
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
