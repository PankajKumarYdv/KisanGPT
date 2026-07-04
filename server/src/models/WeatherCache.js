import mongoose from 'mongoose';

const weatherCacheSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    weatherData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Weather data payload is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to allow quick checks for coordinate matches
weatherCacheSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

// TTL index: auto-deletes the cached weather block once expiresAt is reached
weatherCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);
