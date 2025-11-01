import mongoose from 'mongoose';
import logger from './logger.js';
import { MONGO_URI } from './env.js';

export default async function connectDB() {
  try {
    if (!MONGO_URI) {
      logger.error('❌ MONGO_URI is not defined in environment variables');
      logger.info(
        'Available env vars:',
        Object.keys(process.env).filter(key => key.includes('MONGO'))
      );
      process.exit(1);
    }

    logger.info(
      '🔗 Connecting to MongoDB:',
      MONGO_URI.replace(/\/\/.*@/, '//***:***@')
    );
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection failed', err);
    process.exit(1);
  }
}
