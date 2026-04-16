const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    }
  } catch (err) {
    // Optional auth - ignore errors
  }
  next();
};

module.exports = optionalAuth;
