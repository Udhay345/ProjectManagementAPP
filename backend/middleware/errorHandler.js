// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR Stack:', err.stack);
  console.error('SERVER ERROR Message:', err.message);

  // Default response status and message
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle unique constraint violation (e.g. duplicate email)
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate entry found. The value must be unique.';
    if (err.message.includes('email')) {
      message = 'A user with this email address already exists.';
    }
  }

  // Handle foreign key constraint failures
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    message = 'Invalid reference identifier provided. Relation constraint failed.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
