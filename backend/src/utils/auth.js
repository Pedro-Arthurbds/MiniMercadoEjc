const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não está configurado. Defina a variável de ambiente JWT_SECRET antes de iniciar o servidor.",
  );
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startWith("Bearer ")) {
    return authHeader.split(" ") [1]
  }
  return null
}

module.exports = { hashPassword, comparePassword, generateToken, extractToken}