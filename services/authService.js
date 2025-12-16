const User = require("../models/Users");
const bcrypt = require("bcryptjs");

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const createUser = async ({ name, email, password, role = "user" }) => {
  // Validate uniqueness is left to caller but we also guard here
  const existing = await findUserByEmail( email );
  if (existing) throw { status: 400, message: "Email already registered" };

  const user = await User.create({ name, email, password, role });
  // user.save() triggers pre-save hashing in model
  return user;
};

const verifyPassword = async (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};

const getUserPublic = (user) => {
  if (!user) return null;
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
};

module.exports = {
  findUserByEmail,
  createUser,
  verifyPassword,
  getUserPublic,
};
