// controllers/authController.js
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const { signToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email and password" });
  }

  // always set role = user for public register
  const user = await authService.createUser({ name, email, password, role: "user" });

  const token = signToken(user);
  res.status(201).json({ token, user: authService.getUserPublic(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });

  const user = await authService.findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await authService.verifyPassword(user, password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: authService.getUserPublic(user) });
});

// protected: get current user
const me = asyncHandler(async (req, res) => {
  // protect middleware should have set req.user with id
  const user = await authService.findUserByEmail(req.user.email); // or findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(authService.getUserPublic(user));
});

module.exports = { register, login, me };
