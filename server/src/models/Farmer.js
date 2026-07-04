import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[1-9]\d{5}$/, 'Please fill a valid 6-digit Indian postal code (pincode)'],
    },
    farmName: {
      type: String,
      trim: true,
      default: '',
    },
    landSize: {
      type: Number,
      required: [true, 'Land size is required'],
      min: [0, 'Land size cannot be negative'],
    },
    landUnit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha'],
      default: 'acres',
    },
    cropType: {
      type: String,
      trim: true,
    },
    irrigationType: {
      type: String,
      trim: true,
    },
    soilType: {
      type: String,
      trim: true,
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative'],
      default: 0,
    },
    loanAmount: {
      type: Number,
      min: [0, 'Loan amount cannot be negative'],
      default: 0,
    },
    farmingExperience: {
      type: Number,
      min: [0, 'Farming experience cannot be negative'],
      default: 0,
    },
    livestock: {
      type: [String],
      default: [],
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    // GeoJSON point stored for spatial indexing & queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
farmerSchema.index({ state: 1 });
farmerSchema.index({ district: 1 });
farmerSchema.index({ cropType: 1 });

// Virtual to return coordinates as an object
farmerSchema.virtual('coordinatesObj').get(function () {
  if (this.latitude && this.longitude) {
    return { lat: this.latitude, lng: this.longitude };
  }
  return null;
});

// Pre-save hook to populate GeoJSON location coordinates
farmerSchema.pre('save', function (next) {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude], // GeoJSON format [lng, lat]
    };
  }
  next();
});

export const Farmer = mongoose.model('Farmer', farmerSchema);
