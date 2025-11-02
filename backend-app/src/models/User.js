import mongoose from 'mongoose';
import AddressSchema from './Address.js';

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    profileImage: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: AddressSchema,
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    // Additional fields for your app
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Index for faster queries
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', UserSchema);
