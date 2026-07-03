import mongoose from 'mongoose';
import { env } from '../config/env.js';

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { promise: null };
}

/**
 * Connect to MongoDB once and reuse the connection (local dev + Vercel serverless).
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalCache._mongooseCache.promise) {
    globalCache._mongooseCache.promise = mongoose
      .connect(env.mongodbUri)
      .then(() => {
        console.log('Connected to MongoDB');
        return mongoose.connection;
      })
      .catch((err) => {
        globalCache._mongooseCache.promise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  return globalCache._mongooseCache.promise;
}
