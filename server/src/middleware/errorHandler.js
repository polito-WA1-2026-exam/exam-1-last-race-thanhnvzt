export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  if (status >= 500) {
    console.error(`${req.method} ${req.originalUrl} failed:`, err);
  }

  return res.status(status).json({
    error: err.publicMessage || err.message || 'Internal server error',
  });
}
