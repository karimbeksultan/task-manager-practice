export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || "Internal server error"
  });
}
