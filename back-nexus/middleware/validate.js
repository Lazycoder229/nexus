// middleware/validate.js

/* ==========================================
   BODY VALIDATION — Zod schema
   ========================================== */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Replace req.body with sanitized/parsed data — strips unknown fields
  req.body = result.data;
  next();
};

/* ==========================================
   PARAM VALIDATION — ID params
   ========================================== */
export const validateId = (paramName = "id") => (req, res, next) => {
  const id = parseInt(req.params[paramName]);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      message: `Invalid ${paramName} — must be a positive integer`,
    });
  }

  req.params[paramName] = id; // Normalize to integer
  next();
};

/* ==========================================
   QUERY VALIDATION — Zod schema (optional)
   ========================================== */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      message: "Invalid query parameters",
      errors,
    });
  }

  req.query = result.data;
  next();
};