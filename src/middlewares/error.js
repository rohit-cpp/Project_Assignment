export function notFound(req, res) {
  res.status(404).json({ error: { message: "Not Found" } });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const msg = err.message || "Server Error";
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ error: { message: msg } });
}
