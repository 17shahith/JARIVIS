import jwt from 'jsonwebtoken';
import { logger } from '../config/db.config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jarvis_secret_key';

export const requireAuth = (req, res, next) => {
  // 1. Check if user exists in express-session
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. Check for JWT authorization token in headers
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      logger.warn(`Failed token authorization attempt: ${err.message}`);
    }
  }

  // Unauthorized response
  res.status(401).json({ error: 'Access denied. Authentication required.' });
};
