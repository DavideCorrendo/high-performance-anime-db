// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

function authenticateToken(req, res, next) {
  // Extract token from the cookie parser
  const token = req.cookies.auth_token;

  if (!token)
    return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

module.exports = { authenticateToken, requireRole };
