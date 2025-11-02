import { clerkClient } from '@clerk/clerk-sdk-node';

// Initialize Clerk with your secret key
const clerk = clerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default clerk;