const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const token = header.split(" ")[1];
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
