import mongoose from 'mongoose';

const governmentSchemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: [true, 'Scheme name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'National',
      trim: true,
    },
    eligibility: {
      minLandSize: { type: Number, default: 0 },
      maxLandSize: { type: Number, default: 9999 },
      maxAnnualIncome: { type: Number, default: 9999999 },
      description: { type: String, default: '' },
    },
    benefits: {
      type: String,
      required: [true, 'Benefits detail is required'],
      trim: true,
    },
    applicationLink: {
      type: String,
      trim: true,
      default: '',
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for catalog filters and searches
governmentSchemeSchema.index({ category: 1 });
governmentSchemeSchema.index({ state: 1 });

export const GovernmentScheme = mongoose.model('GovernmentScheme', governmentSchemeSchema);
