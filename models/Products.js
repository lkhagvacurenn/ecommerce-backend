// models/Products.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },

  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },
  newPrice: { type: Number, min: 0 },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

  brand: { type: String, trim: true },

  sizes: [{ type: String }],
  colors: [{ type: String }],
  images: [{ type: String }],

  stock: { type: Number, required: true, min: 0 },
  available: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

// Use a non-async pre save hook and DO NOT accept or call `next()`
// (Mongoose will handle the returned promise if the function is async — but we keep it simple)
productSchema.pre("save", function () {
  // defensive numeric values
  const price = typeof this.price === "number" ? this.price : 0;
  const discount = typeof this.discountPercent === "number" ? this.discountPercent : 0;
  const stock = typeof this.stock === "number" ? this.stock : 0;

  if (discount > 0) {
    this.newPrice = price - (price * discount / 100);
  } else {
    this.newPrice = price;
  }

  // Sync availability
  this.available = stock > 0;
});

// optional text index for searching
productSchema.index({ title: "text", description: "text" });

// defensive export to prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models?.Product || mongoose.model("Product", productSchema);
