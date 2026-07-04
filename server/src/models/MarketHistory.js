import mongoose from 'mongoose';

const marketHistorySchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      lowercase: true,
    },
    mandi: {
      type: String,
      required: [true, 'Mandi name is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    marketPrice: {
      type: Number,
      required: [true, 'Market price is required'],
      min: [0, 'Price cannot be negative'],
    },
    minimumPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    maximumPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    arrivalQuantity: {
      type: Number,
      min: [0, 'Arrival quantity cannot be negative'],
      default: 0,
    },
    priceDate: {
      type: Date,
      required: [true, 'Price date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Single field indexes for fast filter matching
marketHistorySchema.index({ crop: 1 });
marketHistorySchema.index({ district: 1 });
marketHistorySchema.index({ priceDate: -1 });

// Compound Index: Optimized for time-series trend analysis of a crop in a local area
marketHistorySchema.index({ crop: 1, district: 1, priceDate: -1 });

export const MarketHistory = mongoose.model('MarketHistory', marketHistorySchema);
