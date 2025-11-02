import User from '../models/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function me(req, res) {
  try {
    // Get user from local database (synced from Clerk)
    const localUser = await User.findOne({ clerkId: req.user.id });

    // Combine Clerk data with local data
    const userData = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      // Add local database fields if user exists
      ...(localUser && {
        _id: localUser._id,
        address: localUser.address,
        preferences: localUser.preferences,
        lastLoginAt: localUser.lastLoginAt,
        createdAt: localUser.createdAt,
        updatedAt: localUser.updatedAt,
      }),
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { firstName, lastName, address, preferences } = req.body;

    // Update user in Clerk (for firstName, lastName)
    if (firstName !== undefined || lastName !== undefined) {
      await clerkClient.users.updateUser(req.user.id, {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
      });
    }

    // Update local database fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (address !== undefined) updateData.address = address;
    if (preferences !== undefined) updateData.preferences = preferences;

    const localUser = await User.findOneAndUpdate(
      { clerkId: req.user.id },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: localUser.firstName,
      lastName: localUser.lastName,
      role: req.user.role,
      address: localUser.address,
      preferences: localUser.preferences,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Update user avatar in Clerk
    await clerkClient.users.updateUser(req.user.id, {
      publicMetadata: {
        profileImage: imageUrl,
      },
    });

    // Update local database
    await User.findOneAndUpdate(
      { clerkId: req.user.id },
      { profileImage: imageUrl },
      { new: true, upsert: true }
    );

    res.json({
      ok: true,
      user: {
        id: req.user.id,
        profileImage: imageUrl,
      },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
}

export async function listUsers(req, res) {
  try {
    // Get users from local database (synced from Clerk)
    const localUsers = await User.find({ isActive: true }).sort({
      createdAt: -1,
    });

    const formattedUsers = localUsers.map(user => ({
      id: user.clerkId,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Get user by ID (admin only)
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      $or: [{ clerkId: id }, { _id: id }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.clerkId,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      address: user.address,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// Update user preferences
export async function updatePreferences(req, res) {
  try {
    const { preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.id },
      { preferences },
      { new: true, upsert: true }
    );

    res.json({
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

// Update user address
export async function updateAddress(req, res) {
  try {
    const { address } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.id },
      { address },
      { new: true, upsert: true }
    );

    res.json({
      address: user.address,
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
}