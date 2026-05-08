const DEV_JWT_SECRET = 'novafxm-local-development-secret';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  return DEV_JWT_SECRET;
};

module.exports = { getJwtSecret };
