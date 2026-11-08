const { verifyToken } = require('../utils/token');
const { httpError } = require('../utils/httpError');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(httpError(401, 'Invalid or missing token.'));
    return;
  }

  try {
    const payload = verifyToken(token);
    // Readings and reports will filter with this id.
    req.user = { id: payload.id };
    next();
  } catch {
    next(httpError(401, 'Invalid or missing token.'));
  }
}

module.exports = { requireAuth };
