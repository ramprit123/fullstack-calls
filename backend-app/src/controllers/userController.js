import User from '../models/User.js';

export async function me(req, res) {
  const user = await User.findById(req.user._id).select(
    '-password -refreshToken'
  );
  res.json(user);
}

export async function updateProfile(req, res) {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  }).select('-password -refreshToken');
  res.json(user);
}

export async function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage: req.file.filename },
    { new: true }
  );
  res.json({ ok: true, user });
}

export async function listUsers(req, res) {
  const users = await User.find().select('-password -refreshToken');
  res.json(users);
}
