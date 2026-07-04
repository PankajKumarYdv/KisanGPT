const cleanValue = (val) => {
  if (typeof val === 'string') {
    // Basic regex to strip HTML/XML tags to prevent XSS scripts
    return val.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(val)) {
    return val.map(cleanValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleaned = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        cleaned[key] = cleanValue(val[key]);
      }
    }
    return cleaned;
  }
  return val;
};

export const xssSanitizer = (req, res, next) => {
  if (req.body) {
    req.body = cleanValue(req.body);
  }
  if (req.query) {
    req.query = cleanValue(req.query);
  }
  if (req.params) {
    req.params = cleanValue(req.params);
  }
  next();
};
