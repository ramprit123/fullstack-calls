import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signAccess = user =>
  jwt.sign({ sub: user._id, role: user.role }, ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });

export const signRefresh = user =>
  jwt.sign({ sub: user._id }, REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
  });

export const verifyRefresh = token => jwt.verify(token, REFRESH_SECRET);
