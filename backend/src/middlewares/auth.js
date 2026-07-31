const jwt = require("jsonwebtoken");
const { extractToken } = require("../utils/auth");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (req.user.role === "ADMIN" || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: "Sem permissão para essa ação" });
  };
}

module.exports = { authenticate, authorize };
