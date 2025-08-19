export const validate = (schema) => (req, res, next) => {
  try {
    const data = {};
    if (schema.body) data.body = schema.body.parse(req.body);
    if (schema.params) data.params = schema.params.parse(req.params);
    if (schema.query) data.query = schema.query.parse(req.query);
    // attach parsed data if needed
    req.validated = { ...(req.validated || {}), ...data };
    next();
  } catch (e) {
    return res.status(400).json({
      error: { message: "Validation error", details: e.errors || String(e) },
    });
  }
};
