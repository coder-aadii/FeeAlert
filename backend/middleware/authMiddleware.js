const jwt = require('jsonwebtoken');
const User = require('../models/clientModel');

/**
 * Auth middleware to verify JSON Web Tokens.
 *
 * It expects the token to be provided in the Authorization header as "Bearer <token>".
 */
module.exports = async function protect(req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized' });
  }
};