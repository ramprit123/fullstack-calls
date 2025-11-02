import { clerkClient } from '@clerk/clerk-sdk-node';

export async function requireClerkAuth(req, res, next) {
  try {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Clerk
    const payload = await clerkClient.verifyToken(token);

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user information from Clerk
    const user = await clerkClient.users.getUser(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.role || 'user', // Default role
    };

    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
