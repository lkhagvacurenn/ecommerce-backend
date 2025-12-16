// utils/jwt.js
const jwt = require("jsonwebtoken");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = { signToken };
