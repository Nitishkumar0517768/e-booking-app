const { errorResponse } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return errorResponse(res, 400, 'Validation Error', messages);
    }
    return errorResponse(res, 400, err.message);
  }
};

module.exports = validate;

