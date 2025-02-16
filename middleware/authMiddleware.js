const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Authentication middleware
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });

    req.user = decoded;
    next();
  });
};

// Role-based access control middleware
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
