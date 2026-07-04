import mongoose from 'mongoose';

const marketCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      required: [true, 'Cache key is required'],
      unique: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Cache data payload is required'],
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

// TTL index: auto-deletes the cached block once expiresAt is reached
marketCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MarketCache = mongoose.model('MarketCache', marketCacheSchema);
