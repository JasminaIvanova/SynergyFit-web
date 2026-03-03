const requireAdmin = (req, res, next) => {
  // Check if user exists (from auth middleware)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  // Check if admin account is active
  if (req.user.status === 'suspended') {
    return res.status(403).json({ message: 'Account suspended' });
  }

  next();
};

module.exports = { requireAdmin };
