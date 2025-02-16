module.exports = (err, req, res, next) => {
  // Default to 500 if no status code is provided
  const statusCode = err.statusCode || 500;

  // Log detailed error information for debugging
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  // Send detailed error info only in development mode
  const response = {
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
