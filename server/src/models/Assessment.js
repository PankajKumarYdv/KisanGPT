import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required'],
    },
    financialRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    weatherRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    cropRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    marketRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    wellnessRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    overallRisk: {
      type: Number,
      min: [0, 'Risk must be between 0 and 100'],
      max: [100, 'Risk must be between 0 and 100'],
      required: true,
    },
    recommendation: {
      type: String,
      required: [true, 'Recommendation text is required'],
    },
    summary: {
      type: String,
      required: [true, 'Assessment summary is required'],
    },
    assessmentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'Failed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups and queries
assessmentSchema.index({ farmerId: 1 });
assessmentSchema.index({ overallRisk: 1 });
assessmentSchema.index({ createdAt: -1 });

export const Assessment = mongoose.model('Assessment', assessmentSchema);
