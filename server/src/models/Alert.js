import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Alert description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Alert type is required'],
      enum: ['weather', 'market', 'pest', 'system', 'general'],
      default: 'general',
    },
    severity: {
      type: String,
      required: [true, 'Alert severity is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'Medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
alertSchema.index({ farmerId: 1 });
alertSchema.index({ severity: 1 });
// TTL Index: deletes document at specified expiresAt timestamp
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Alert = mongoose.model('Alert', alertSchema);
