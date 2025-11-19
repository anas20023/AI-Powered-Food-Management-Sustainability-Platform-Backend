export default function errorHandler(err, req, res, next) {
  if (res.headersSent || res.locals[Symbol.for("res.sent")]) {
    return next(err);
  }
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
