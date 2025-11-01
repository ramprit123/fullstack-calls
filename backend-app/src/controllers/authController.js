import User from '../models/User.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/token.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email exists' });
    const user = await User.create({ name, email, password });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ id: user._id, email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ id: user._id, email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user || user.refreshToken !== token)
      return res.status(401).json({ error: 'Invalid refresh' });
    const newAccess = signAccess(user);
    const newRefresh = signRefresh(user);
    user.refreshToken = newRefresh;
    await user.save();
    res.cookie('accessToken', newAccess, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefresh, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Invalid refresh' });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.sub, {
        $unset: { refreshToken: 1 },
      });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
}
