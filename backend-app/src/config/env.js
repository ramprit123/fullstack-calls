import * as dotenv from 'dotenv';
dotenv.config({
  quiet: trues,
});

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const API_KEY = process.env.API_KEY;
export const REDIS_URL = process.env.REDIS_URL;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
