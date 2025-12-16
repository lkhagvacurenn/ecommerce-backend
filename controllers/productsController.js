// controllers/productsController.js
const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/productsService");

/**
 * POST /api/products
 * Admin only (protect + admin middleware should be applied on the route)
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
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
  } = req.body;

  const product = await productService.createProduct({
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
  });

  res.status(201).json(productService.getProductPublic(product));
});

/**
 * GET /api/products
 * Public listing with search, filter, pagination and sorting
 * Query params: q, category, minPrice, maxPrice, page, limit, sortBy
 */
const listProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, page, limit, sortBy } = req.query;

  const options = {
    q,
    category,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 40,
    sortBy: sortBy || "-createdAt"
  };

  const { items, total } = await productService.findProducts(options);

  res.json({
    items: items.map(productService.getProductPublic),
    total,
    page: options.page,
    limit: options.limit
  });
});

/**
 * GET /api/products/:id
 * Get single product by id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductByID(id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(productService.getProductPublic(product));
});

/**
 * PUT /api/products/:id
 * Update product (admin only, or owner logic if implemented)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await productService.updateProduct(id, updates);
  res.json(productService.getProductPublic(updated));
});

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productService.deleteProduct(id);
  res.json({ message: "Product deleted" });
});

const bulkCreateProducts = asyncHandler(async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ success: false, message: "Array required" });
  }

  const results = [];
  for (const p of products) {
    const created = await productService.createProduct(p);
    results.push(productService.getProductPublic(created));
  }

  res.status(201).json({
    success: true,
    count: results.length,
    items: results
  });
});


const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
});

module.exports = {
  createProduct,
  listProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkCreateProducts
};
