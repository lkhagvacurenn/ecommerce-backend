// services/productService.js
const Products = require("../models/Products"); // your Product model
const Categories = require("../models/Categories"); 
const mongoose = require("mongoose");

const findProductByTitle = async (title) => {
  return Products.findOne({ title });
};

const getProductByID = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Products.findById(id).populate("category"); // populate category for richer response
};

/**
 * Find products with optional filters, pagination, sorting
 * options = { q, category, minPrice, maxPrice, page, limit, sortBy }
 */
const findProducts = async (options = {}) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    limit = 20,
    sortBy = "-createdAt"
  } = options;

  const filter = {};

  if (q) {
    // simple text-ish search on title and description
    filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") }
    ];
  }

  if (category) {
    let catId = null;

    // if category looks like an ObjectId, use it directly
    if (mongoose.Types.ObjectId.isValid(category)) {
      catId = category;
    } else {
      // otherwise try to resolve from slug (case-insensitive)
      const cat = await Categories.findOne({ slug: category }).select("_id");
      if (cat) catId = cat._id;
      // if not found, we keep catId null -> no category filter (or we could set filter to impossible)
      // Optionally: if you prefer no results when slug not found, set filter.category = null impossible query
      // e.g. filter.category = { $exists: false, $eq: null } -> no match
    }

    if (catId) filter.category = catId;
    else {
      // No matching category found for provided slug -> return empty result early
      return { items: [], total: 0, limit: Number(limit) };
    }
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const query = Products.find(filter).populate("category").sort(sortBy).limit(Math.max(1, limit));

  const [items, total] = await Promise.all([query.exec(), Products.countDocuments(filter)]);
  return { items, total, limit: Number(limit) || null };
};

const createProduct = async ({
  title,
  description,
  price,
  discountPercent = 0,
  category,
  brand,
  sizes,
  colors,
  images,
  stock,
}) => {
  // Validate required fields
  if (!title || !description || price === undefined || !category || !Array.isArray(sizes) || !Array.isArray(colors) || !Array.isArray(images) || stock === undefined) {
    throw { status: 400, message: "Missing required product fields" };
  }

  // Optional: ensure category is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw { status: 400, message: "Invalid category id" };
  }
  const product = await Products.create({
    title,
    description,
    price,
    discountPercent,
    category,
    brand,
    sizes,
    colors,
    images,
    stock,
    available: stock > 0
  });

  return product;
};

const updateProduct = async (id, updates = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw { status: 400, message: "Invalid product id" };

  // If category is being updated, ensure it's a valid ObjectId
  if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
    throw { status: 400, message: "Invalid category id" };
  }

  // Use findById then assign + save so pre-save hooks (newPrice calc) run
  const product = await Products.findById(id);
  if (!product) throw { status: 404, message: "Product not found" };

  Object.assign(product, updates);
  // ensure available field follows stock if stock changed
  if (updates.stock !== undefined) {
    product.available = updates.stock > 0;
  }

  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw { status: 400, message: "Invalid product id" };
  const product = await Products.findByIdAndDelete(id);
  if (!product) throw { status: 404, message: "Product not found" };
  return product;
};

const getProductPublic = (product) => {
  if (!product) return null;
  // If product is a Mongoose doc, ensure populated category handled
  const category = product.category && product.category._id ? {
    id: product.category._id.toString(),
    name: product.category.name,
    slug: product.category.slug
  } : (product.category ? product.category : null);

  return {
    id: product._id.toString(),
    title: product.title,
    description: product.description,
    price: product.price,
    discountPercent: product.discountPercent,
    newPrice: product.newPrice,
    category,
    brand: product.brand,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images,
    stock: product.stock,
    available: product.available,
    createdAt: product.createdAt
  };
};

const getAllProducts = async () => {
  const products = await Products.find({}).populate("category");
  return products.map(getProductPublic);
};

module.exports = {
  findProductByTitle,
  getProductByID,
  findProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductPublic,
  getAllProducts
};
