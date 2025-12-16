// models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [cartItemSchema], default: [] },
  status: { type: String, enum: ["active", "completed", "pending"], required: true, default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// update timestamps
cartSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// defensive export to avoid OverwriteModelError
module.exports = mongoose.models?.Cart || mongoose.model("Cart", cartSchema);
