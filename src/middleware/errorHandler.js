module.exports = function errorHandler(err, req, res, next) {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;

  const payload = {
    error: {
      message: err.message || "Internal Server Error",
    },
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
};
